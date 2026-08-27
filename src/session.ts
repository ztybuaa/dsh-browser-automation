import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'
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
  readonly page: Page

  private constructor(browser: Browser | null, context: BrowserContext, page: Page, config: BrowserConfig, homeDir: string) {
    this.browser = browser
    this.context = context
    this.page = page
    this.config = config
    this.homeDir = homeDir
  }

  /** Launch a browser and open a fresh page. */
  static async create(config: BrowserConfig): Promise<BrowserSession> {
    const args = [
      '--disable-crash-reporter',
      '--disable-metrics-reporting',
      '--no-first-run',
      '--disable-background-networking',
      '--disable-blink-features=AutomationControlled',
    ]
    const options = {
      headless: config.headless,
      args,
      ...(config.executablePath !== undefined ? { executablePath: config.executablePath } : {}),
    }
    // A private HOME keeps the browser self-contained: profile, crashpad, and
    // cache land under this temp dir instead of the user's real profile.
    const homeDir = mkdtempSync(join(tmpdir(), 'dsh-browser-use-'))
    const browser = await chromium.launch({ ...options, env: { ...process.env, HOME: homeDir } })
    const context = await browser.newContext()
    const page = await context.newPage()
    return new BrowserSession(browser, context, page, config, homeDir)
  }

  /** Open a URL and wait for its load event. */
  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'load', timeout: this.config.timeoutMs })
  }

  /** Whether the underlying browser is still connected. */
  isAlive(): boolean {
    return this.browser?.isConnected() ?? false
  }

  /** Close the browser and release its resources. */
  async close(): Promise<void> {
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
