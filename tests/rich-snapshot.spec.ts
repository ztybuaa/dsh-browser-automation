import { describe, expect, it } from 'vitest'
import { BrowserSession } from '../src/session.ts'

describe('extract truncation', () => {
  it('truncates the extract text at maxChars', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000, maxChars: 20 })
    try {
      await session.page.setContent(`<p>${'x'.repeat(500)}</p>`)
      const text = await session.extractText()
      expect(text.length).toBeLessThan(100)
      expect(text).toContain('truncated')
    } finally {
      await session.close()
    }
  })
})
