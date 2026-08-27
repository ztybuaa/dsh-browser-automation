import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createServer, type Server } from 'node:http'
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

  ctx = new Context()
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  fiber = await ctx.plugin({ name, inject, Config, apply }, { headless: true, timeoutMs: 15000 })
})

afterAll(async () => {
  await fiber?.dispose()
  await new Promise<void>((resolve) => server.close(() => resolve()))
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
})
