import { describe, expect, it } from 'vitest'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { BrowserSession, BrowserSessionManager } from '../src/session.ts'

describe('regression fixes', () => {
  it('excludes hidden elements from the snapshot', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.page.setContent('<button>Visible</button><button style="display:none">Hidden</button>')
      const snap = await session.snapshot()
      expect(snap.elements).toHaveLength(1)
      expect(snap.elements[0].name).toBe('Visible')
    } finally {
      await session.close()
    }
  })

  it('presses a keyboard key', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.page.setContent('<input id="x"><script>window.__keys=[];document.getElementById("x").addEventListener("keydown",(e)=>window.__keys.push(e.key));</script>')
      await session.page.focus('#x')
      await session.pressKey('Enter')
      const keys = await session.page.evaluate(() => (window as any).__keys)
      expect(keys).toContain('Enter')
    } finally {
      await session.close()
    }
  })

  it('labels submit inputs as buttons with their value as name', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.page.setContent('<input type="text" id="kw"><input type="submit" value="百度一下">')
      const snap = await session.snapshot()
      const btn = snap.elements.find((e) => e.role === 'button')
      expect(btn).toBeDefined()
      expect(btn!.name).toBe('百度一下')
      const box = snap.elements.find((e) => e.role === 'textbox')
      expect(box).toBeDefined()
    } finally {
      await session.close()
    }
  })

  it('recreates a session when the cached one has been closed', async () => {
    const manager = new BrowserSessionManager({ headless: true, timeoutMs: 15000 })
    const key = { id: 'a' }
    try {
      const s1 = await manager.requireSession(key)
      await s1.close()
      const s2 = await manager.requireSession(key)
      expect(s2).not.toBe(s1)
    } finally {
      await manager.dispose()
    }
  })

  it('bypasses the proxy for localhost', async () => {
    const server = createServer((_req, res) => {
      res.setHeader('content-type', 'text/html; charset=utf-8')
      res.end('<html><head><title>Local</title></head><body>ok</body></html>')
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    // 用一个必然失败的代理（无人监听端口）：若 localhost 未 bypass，导航就会走代理而失败
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000, proxy: 'http://127.0.0.1:1' })
    try {
      await session.navigate(base)
      expect(await session.page.title()).toBe('Local')
    } finally {
      await session.close()
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  })

  it('drives a custom listbox dropdown end to end', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.page.setContent(`<html><body>
        <div id="dd" role="listbox" aria-label="Sort">Sort</div>
        <div id="opt" role="option" style="display:none">Rising</div>
        <script>
          document.getElementById('dd').addEventListener('click', () => {
            document.getElementById('opt').style.display = 'block'
          })
        </script>
      </body></html>`)
      // 初始快照：listbox 可见，option 被 CSS 隐藏（:visible 过滤）
      const before = await session.snapshot()
      const ddRef = before.elements.find((e) => e.role === 'listbox')?.ref
      expect(ddRef).toBeDefined()
      expect(before.elements.some((e) => e.role === 'option')).toBe(false)
      // 点开 listbox → option 变可见 → 再快照能看见 → 点 option
      await session.click(ddRef!)
      const after = await session.snapshot()
      const opt = after.elements.find((e) => e.role === 'option')
      expect(opt).toBeDefined()
      await session.click(opt!.ref)
    } finally {
      await session.close()
    }
  })
})
