import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createServer, type Server } from 'node:http'
import { existsSync, mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { AddressInfo } from 'node:net'
import { Context } from '@deepseek-ai/cordis'
import { CallId } from '@deepseek-ai/dsh-llm'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { apply, Config, inject, name } from '../src/index.ts'
import type { PageSnapshot } from '../src/session.ts'

type PluginFiber = Awaited<ReturnType<Context['plugin']>>

let ctx: Context
let fiber: PluginFiber
let server: Server
let base: string
let shotDir: string

beforeAll(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    res.setHeader('content-type', 'text/html; charset=utf-8')
    switch (url.pathname) {
      case '/':
        res.end('<html><head><title>Home</title></head><body><a href="/about">About</a><button>Go</button><input aria-label="Name"></body></html>')
        break
      case '/about':
        res.end('<html><head><title>About</title></head><body><p>About page</p></body></html>')
        break
      case '/long':
        res.end(`<html><head><title>Long</title></head><body>${Array.from({ length: 100 }, (_, i) => `<p>row ${i}</p>`).join('')}</body></html>`)
        break
      case '/form':
        res.end('<html><head><title>Form</title></head><body><form action="/submit" method="get"><input name="name" aria-label="Name"><button type="submit">Submit</button></form></body></html>')
        break
      case '/submit':
        res.end(`<html><head><title>Submitted</title></head><body><p>Hello, ${url.searchParams.get('name') ?? ''}</p></body></html>`)
        break
      default:
        res.statusCode = 404
        res.end('not found')
    }
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  shotDir = mkdtempSync(join(tmpdir(), 'dsh-browser-use-tools-'))

  ctx = new Context()
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  fiber = await ctx.plugin({ name, inject, Config, apply }, { headless: true, timeoutMs: 15000, screenshotDir: shotDir })
})

afterAll(async () => {
  await fiber?.dispose()
  await new Promise<void>((resolve) => server.close(() => resolve()))
  rmSync(shotDir, { recursive: true, force: true })
})

const signal = new AbortController().signal
let callSeq = 0

async function call(toolName: string, args: Record<string, unknown>): Promise<{ isError: boolean; value: any }> {
  const result = await ctx.tools.execute({
    signal,
    callId: CallId(`c${++callSeq}`),
    name: toolName,
    arguments: args,
  })
  return { isError: result.isError, value: result.value }
}

function refOf(snap: PageSnapshot, role: string, label: string): number {
  const el = snap.elements.find((e) => e.role === role && e.name === label)
  if (!el) throw new Error(`no ${role} "${label}" in snapshot`)
  return el.ref
}

describe('browser tools', () => {
  it('navigates and returns an indexed snapshot', async () => {
    const r = await call('browser_navigate', { url: base })
    expect(r.isError).toBe(false)
    const snap = r.value as PageSnapshot
    expect(snap.title).toBe('Home')
    expect(refOf(snap, 'link', 'About')).toBeGreaterThan(0)
    expect(refOf(snap, 'button', 'Go')).toBeGreaterThan(0)
  })

  it('clicks an element by ref', async () => {
    const nav = await call('browser_navigate', { url: base })
    const snap = nav.value as PageSnapshot
    const linkRef = refOf(snap, 'link', 'About')
    const clicked = await call('browser_click', { ref: linkRef })
    expect(clicked.isError).toBe(false)
    const after = await call('browser_snapshot', {})
    expect((after.value as PageSnapshot).url).toContain('/about')
  })

  it('types into an input by ref and submits', async () => {
    await call('browser_navigate', { url: `${base}/form` })
    const snap = (await call('browser_snapshot', {})).value as PageSnapshot
    const inputRef = refOf(snap, 'textbox', 'Name')
    const submitRef = refOf(snap, 'button', 'Submit')
    const typed = await call('browser_type', { ref: inputRef, text: 'Ada' })
    expect(typed.isError).toBe(false)
    const submitted = await call('browser_click', { ref: submitRef })
    expect(submitted.isError).toBe(false)
    const after = (await call('browser_snapshot', {})).value as PageSnapshot
    expect(after.url).toContain('/submit')
  })

  it('scrolls the page', async () => {
    await call('browser_navigate', { url: `${base}/long` })
    const r = await call('browser_scroll', { direction: 'down', amount: 600 })
    expect(r.isError).toBe(false)
  })

  it('saves a non-empty screenshot via the tool', async () => {
    await call('browser_navigate', { url: base })
    const r = await call('browser_screenshot', {})
    expect(r.isError).toBe(false)
    const path = String(r.value)
    expect(existsSync(path)).toBe(true)
    expect(statSync(path).size).toBeGreaterThan(0)
  })

  it('extracts page text via the tool', async () => {
    await call('browser_navigate', { url: `${base}/about` })
    const r = await call('browser_extract', { mode: 'text' })
    expect(r.isError).toBe(false)
    expect(String(r.value)).toContain('About page')
  })

  it('runs a full browse flow and closes cleanly', async () => {
    const nav = await call('browser_navigate', { url: base })
    expect(nav.isError).toBe(false)

    const text = await call('browser_extract', { mode: 'text' })
    expect(String(text.value)).toContain('About')

    const snap = (await call('browser_snapshot', {})).value as PageSnapshot
    const linkRef = refOf(snap, 'link', 'About')
    const clicked = await call('browser_click', { ref: linkRef })
    expect(clicked.isError).toBe(false)
    expect(((await call('browser_snapshot', {})).value as PageSnapshot).url).toContain('/about')

    const closed = await call('browser_close', {})
    expect(closed.isError).toBe(false)
    expect((closed.value as { message: string }).message).toBe('browser session closed')

    const reopened = await call('browser_navigate', { url: base })
    expect(reopened.isError).toBe(false)
    expect((reopened.value as PageSnapshot).title).toBe('Home')
  })
})
