import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createServer, type Server } from 'node:http'
import { existsSync, mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { AddressInfo } from 'node:net'
import { BrowserSession } from '../src/session.ts'

let server: Server
let base: string
let shotDir: string

beforeAll(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    res.setHeader('content-type', 'text/html; charset=utf-8')
    if (url.pathname === '/long') {
      const rows = Array.from({ length: 100 }, (_, i) => `<p>row ${i}</p>`).join('')
      res.end(`<html><head><title>Long</title></head><body>${rows}</body></html>`)
    } else {
      res.end('<html><head><title>Home</title></head><body><p>Hello Browser</p></body></html>')
    }
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  shotDir = mkdtempSync(join(tmpdir(), 'dsh-browser-use-shots-'))
})

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
  rmSync(shotDir, { recursive: true, force: true })
})

describe('browser actions', () => {
  it('scrolls the page down', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.navigate(`${base}/long`)
      const before = await session.page.evaluate(() => window.scrollY)
      await session.scroll('down', 800)
      const after = await session.page.evaluate(() => window.scrollY)
      expect(after).toBeGreaterThan(before)
    } finally {
      await session.close()
    }
  })

  it('saves a non-empty screenshot', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.navigate(base)
      const path = join(shotDir, 'shot.png')
      await session.screenshot(path)
      expect(existsSync(path)).toBe(true)
      expect(statSync(path).size).toBeGreaterThan(0)
    } finally {
      await session.close()
    }
  })

  it('extracts visible body text', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.navigate(base)
      const text = await session.extractText()
      expect(text).toContain('Hello Browser')
    } finally {
      await session.close()
    }
  })
})
