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

  it('extracts data from hidden tables (screen-reader tables)', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.page.setContent(`<body>
        <p>Visible text</p>
        <table style="display:none">
          <tr><td>name</td><td>value</td></tr>
          <tr><td>apple</td><td>100</td></tr>
        </table>
      </body>`)
      const text = await session.extractText()
      expect(text).toContain('Visible text')
      expect(text).toContain('apple')
      expect(text).toContain('100')
    } finally {
      await session.close()
    }
  })
})
