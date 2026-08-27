import { chromium, type Browser, type BrowserContext, type Locator, type Page } from 'playwright'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** Session-level configuration resolved once at plugin load. */
export interface BrowserConfig {
  /** Launch a headless browser when true; otherwise a visible window. */
  headless: boolean
  /** Path to a system browser executable. Omit to use Playwright's bundled chromium. */
  executablePath?: string
  /** Navigation timeout in milliseconds. */
  timeoutMs: number
  /** Proxy server URL, e.g. http://127.0.0.1:7897. Omit for a direct connection. */
  proxy?: string
  /** Cap on characters returned by browser_extract. */
  maxChars?: number
  /** Browser channel (e.g. 'chrome') to use the installed Chrome instead of bundled chromium. */
  channel?: string
  /** Persistent profile directory; login/cookies survive across sessions when set. */
  userDataDir?: string
  /** Start the browser minimized to the taskbar. */
  minimized?: boolean
  /** CDP endpoint (e.g. http://127.0.0.1:9222) to attach to an already-running Chrome. */
  cdpUrl?: string
}

/** One element in a snapshot, addressed by its 1-based `ref`. */
export interface SnapshotElement {
  ref: number
  role: string
  name: string
  /** Optional ARIA state (checked/selected/expanded/disabled), present only when the element has one. */
  state?: string
}

/** The accessibility snapshot a tool returns to the model. */
export interface PageSnapshot {
  title: string
  url: string
  elements: SnapshotElement[]
}

/** Truncate text at a character cap without splitting a surrogate pair. */
function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  let end = maxChars
  while (end > 0 && (text.charCodeAt(end) & 0xfc00) === 0xdc00) end -= 1
  return `${text.slice(0, end)}\n…(truncated)`
}

/** Interactive ARIA widget roles the snapshot selector covers, alongside native tags. */
const INTERACTIVE_ROLES = [
  'button', 'link', 'textbox', 'combobox', 'listbox', 'option', 'tab',
  'menuitem', 'menuitemcheckbox', 'menuitemradio', 'checkbox', 'radio',
  'switch', 'searchbox', 'slider', 'spinbutton', 'treeitem',
] as const
const TAG_SELECTOR = 'a[href]:visible, button:visible, input:visible, select:visible, textarea:visible, [contenteditable="true"]:visible'
const ROLE_SELECTOR = INTERACTIVE_ROLES.map((r) => `[role="${r}"]:visible`).join(', ')
const SNAPSHOT_SELECTOR = `${TAG_SELECTOR}, ${ROLE_SELECTOR}`

/** Project a snapshot to model-facing prose. */
export function formatSnapshot(snapshot: PageSnapshot): string {
  const lines = [
    `Title: ${snapshot.title}`,
    `URL: ${snapshot.url}`,
    '',
    'Interactive elements:',
  ]
  for (const el of snapshot.elements) {
    lines.push(`[${el.ref}] ${el.role} "${el.name}"${el.state ? ` (${el.state})` : ''}`)
  }
  if (snapshot.elements.length === 0) lines.push('(none)')
  return lines.join('\n')
}

/**
 * One live browser session: a launched chromium, its context, and a single
 * page. The owning manager owns its lifecycle.
 */
export class BrowserSession {
  private readonly browser: Browser | null
  private readonly context: BrowserContext
  private readonly config: BrowserConfig
  private readonly homeDir: string
  private readonly ownsBrowser: boolean
  readonly page: Page
  /** ref (1-based index) -> live locator, captured by the most recent snapshot. */
  private refs = new Map<number, Locator>()

  private constructor(browser: Browser | null, context: BrowserContext, page: Page, config: BrowserConfig, homeDir: string, ownsBrowser: boolean) {
    this.browser = browser
    this.context = context
    this.page = page
    this.config = config
    this.homeDir = homeDir
    this.ownsBrowser = ownsBrowser
  }

  /** Launch a browser and open a fresh page. */
  static async create(config: BrowserConfig): Promise<BrowserSession> {
    const args = [
      '--disable-crash-reporter',
      '--disable-metrics-reporting',
      '--no-first-run',
      '--disable-background-networking',
      '--disable-blink-features=AutomationControlled',
      ...(config.minimized ? ['--start-minimized'] : []),
    ]
    const options = {
      headless: config.headless,
      ...(config.channel !== undefined ? { channel: config.channel } : {}),
      ...(config.proxy !== undefined ? { proxy: { server: config.proxy, bypass: '<local>,localhost,127.0.0.1,::1' } } : {}),
      args,
      ...(config.executablePath !== undefined ? { executablePath: config.executablePath } : {}),
    }
    if (config.cdpUrl !== undefined) {
      // Attach to an already-running Chrome: reuse its login state and profile.
      const browser = await chromium.connectOverCDP(config.cdpUrl)
      const context = browser.contexts()[0]
      const page = await context.newPage()
      return new BrowserSession(browser, context, page, config, '', false)
    }
    if (config.userDataDir !== undefined) {
      // Persistent profile: login/cookies survive across sessions.
      const context = await chromium.launchPersistentContext(config.userDataDir, options)
      const browser = context.browser()
      const page = context.pages()[0] ?? await context.newPage()
      return new BrowserSession(browser, context, page, config, '', true)
    }
    // A private HOME keeps the browser self-contained: profile, crashpad, and
    // cache land under this temp dir instead of the user's real profile.
    const homeDir = mkdtempSync(join(tmpdir(), 'dsh-browser-use-'))
    const browser = await chromium.launch({ ...options, env: { ...process.env, HOME: homeDir } })
    const context = await browser.newContext()
    const page = await context.newPage()
    return new BrowserSession(browser, context, page, config, homeDir, true)
  }

  /** Open a URL and wait for its load event. */
  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'load', timeout: this.config.timeoutMs })
  }

  /**
   * Project the current page into an accessibility snapshot: title, URL, and
   * an indexed list of interactive elements. The 1-based indices become the
   * `ref`s that click/type resolve against this snapshot.
   */
  async snapshot(): Promise<PageSnapshot> {
    const title = await this.page.title().catch(() => '')
    const url = this.page.url()
    const locator = this.page.locator(SNAPSHOT_SELECTOR)
    const count = await locator.count()
    const elements: SnapshotElement[] = []
    const refs = new Map<number, Locator>()
    for (let i = 0; i < count; i++) {
      const el = locator.nth(i)
      const ref = i + 1
      const state = await this.stateOf(el)
      elements.push({ ref, role: await this.roleOf(el), name: await this.nameOf(el), ...(state ? { state } : {}) })
      refs.set(ref, el)
    }
    this.refs = refs
    return { title, url, elements }
  }

  /** Click the element addressed by `ref` from the most recent snapshot. */
  async click(ref: number): Promise<void> {
    const locator = this.refs.get(ref)
    if (locator === undefined) {
      throw new Error(`browser-use: no element for ref ${ref}; call snapshot first`)
    }
    await locator.click({ timeout: this.config.timeoutMs })
  }

  /** Type text into the input addressed by `ref` from the most recent snapshot. */
  async type(ref: number, text: string): Promise<void> {
    const locator = this.refs.get(ref)
    if (locator === undefined) {
      throw new Error(`browser-use: no element for ref ${ref}; call snapshot first`)
    }
    await locator.fill(text, { timeout: this.config.timeoutMs })
  }

  /** Scroll the page by a pixel amount in the given direction. */
  async scroll(direction: 'up' | 'down', amount: number): Promise<void> {
    const delta = direction === 'down' ? amount : -amount
    await this.page.evaluate((n) => window.scrollBy(0, n), delta)
  }

  /** Capture the current viewport as a PNG at the given path. */
  async screenshot(path: string): Promise<void> {
    await this.page.screenshot({ path, timeout: this.config.timeoutMs })
  }

  /** Extract the visible text content of the page body. */
  async extractText(): Promise<string> {
    const text = await this.page.locator('body').innerText().catch(() => '')
    return truncate(text, this.config.maxChars ?? 20000)
  }

  /** Press a keyboard key on the focused element (e.g. Enter, Escape, Tab). */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key)
  }

  /** Whether the underlying browser is still connected. */
  isAlive(): boolean {
    return this.browser?.isConnected() ?? false
  }

  private async roleOf(loc: Locator): Promise<string> {
    const explicit = await loc.getAttribute('role').catch(() => null)
    if (explicit) return explicit
    const tag = await loc.evaluate((el) => (el as HTMLElement).tagName.toLowerCase()).catch(() => '')
    if (tag === 'input') {
      const type = (await loc.getAttribute('type').catch(() => null)) ?? 'text'
      if (type === 'submit' || type === 'button' || type === 'image' || type === 'reset') return 'button'
      if (type === 'checkbox') return 'checkbox'
      if (type === 'radio') return 'radio'
      return 'textbox'
    }
    const byTag: Record<string, string> = { a: 'link', button: 'button', select: 'combobox', textarea: 'textbox' }
    return byTag[tag] ?? tag
  }

  private async nameOf(loc: Locator): Promise<string> {
    const label = await loc.getAttribute('aria-label').catch(() => null)
    if (label) return label
    const placeholder = await loc.getAttribute('placeholder').catch(() => null)
    if (placeholder) return placeholder
    const value = await loc.getAttribute('value').catch(() => null)
    if (value) return value
    const text = await loc.innerText().catch(() => '')
    return text.trim()
  }

  private async stateOf(loc: Locator): Promise<string | undefined> {
    for (const attr of ['aria-checked', 'aria-selected', 'aria-expanded'] as const) {
      const v = await loc.getAttribute(attr).catch(() => null)
      if (v !== null && v !== undefined && v !== '') return `${attr.slice('aria-'.length)}=${v}`
    }
    const disabled = await loc.isDisabled().catch(() => false)
    if (disabled) return 'disabled'
    return undefined
  }

  /** Close the browser and release its resources. */
  async close(): Promise<void> {
    if (!this.ownsBrowser) {
      // CDP: we borrowed the user's running Chrome — close only our page, leave their browser intact.
      await this.page.close().catch(() => {})
      return
    }
    // Close the context first: for a persistent profile this flushes cookies
    // to disk before the browser shuts down.
    await this.context.close().catch(() => {})
    await this.browser?.close().catch(() => {})
    if (this.homeDir) rmSync(this.homeDir, { recursive: true, force: true })
  }
}

/**
 * Lazily-created per-agent browser sessions. An `agent` key isolates one
 * session per agent; calls without a key share a default session. Disposal
 * closes every live session so plugin unload never leaks a browser process.
 */
export class BrowserSessionManager {
  private readonly config: BrowserConfig
  private readonly sessions = new WeakMap<object, BrowserSession>()
  private readonly live = new Set<BrowserSession>()
  private defaultSession: BrowserSession | undefined

  constructor(config: BrowserConfig) {
    this.config = config
  }

  /** Resolve (creating if needed) the session for one agent key. */
  async requireSession(key?: object): Promise<BrowserSession> {
    if (key !== undefined) {
      const existing = this.sessions.get(key)
      if (existing !== undefined) {
        if (existing.isAlive()) return existing
        this.sessions.delete(key)
        this.live.delete(existing)
      }
      const created = await this.createSession()
      this.sessions.set(key, created)
      return created
    }
    if (this.defaultSession !== undefined && !this.defaultSession.isAlive()) {
      this.live.delete(this.defaultSession)
      this.defaultSession = undefined
    }
    this.defaultSession ??= await this.createSession()
    return this.defaultSession
  }

  /** Close the session for one agent key (or the default when key is absent). */
  async closeSession(key?: object): Promise<boolean> {
    let session: BrowserSession | undefined
    if (key !== undefined) {
      session = this.sessions.get(key)
      if (session !== undefined) this.sessions.delete(key)
    } else {
      session = this.defaultSession
      this.defaultSession = undefined
    }
    if (session === undefined) return false
    this.live.delete(session)
    await session.close()
    return true
  }

  /** Close every live session. */
  async dispose(): Promise<void> {
    const sessions = [...this.live]
    this.live.clear()
    this.defaultSession = undefined
    await Promise.all(sessions.map((session) => session.close()))
  }

  /** Number of currently-live sessions (test hook). */
  get liveSessionCount(): number {
    return this.live.size
  }

  private async createSession(): Promise<BrowserSession> {
    const session = await BrowserSession.create(this.config)
    this.live.add(session)
    return session
  }
}
