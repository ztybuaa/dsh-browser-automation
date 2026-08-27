import { describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BrowserSession } from '../src/session.ts'

describe('persistent profile', () => {
  it('persists cookies across sessions via userDataDir', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-profile-'))
    try {
      const s1 = await BrowserSession.create({ headless: true, timeoutMs: 15000, userDataDir: dir })
      // 用持久 cookie（带过期时间）——会话 cookie（expires=-1）本就不落盘
      await s1.page.context().addCookies([{ name: 'test', value: '1', url: 'http://example.com', expires: Math.floor(Date.now() / 1000) + 3600 }])
      await s1.close()

      const s2 = await BrowserSession.create({ headless: true, timeoutMs: 15000, userDataDir: dir })
      const cookies = await s2.page.context().cookies('http://example.com')
      expect(cookies.some((c) => c.name === 'test' && c.value === '1')).toBe(true)
      await s2.close()
    } finally {
      // Windows 下浏览器进程退出后 profile 目录锁释放有延迟，等一会再删，删不掉就忽略
      await new Promise((r) => setTimeout(r, 800))
      try {
        rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 })
      } catch {
        /* profile dir may still be locked by the closing browser; ignore */
      }
    }
  })
})
