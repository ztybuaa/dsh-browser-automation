import { describe, expect, it } from 'vitest'
import { BrowserSession } from '../src/session.ts'

describe('BrowserSession.snapshot', () => {
  it('returns an indexed list of interactive elements with roles and names', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.page.setContent(`<html><body>
        <a href="/about">About Us</a>
        <button>Submit</button>
        <input aria-label="Search" placeholder="type here">
      </body></html>`)
      const snap = await session.snapshot()
      expect(snap.elements.length).toBe(3)
      expect(snap.elements[0]).toMatchObject({ ref: 1, role: 'link', name: 'About Us' })
      expect(snap.elements[1]).toMatchObject({ ref: 2, role: 'button', name: 'Submit' })
      expect(snap.elements[2]).toMatchObject({ ref: 3, role: 'textbox', name: 'Search' })
    } finally {
      await session.close()
    }
  })

  it('uses aria-label for the accessible name when present', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.page.setContent('<button aria-label="Close dialog">x</button>')
      const snap = await session.snapshot()
      expect(snap.elements).toHaveLength(1)
      expect(snap.elements[0]).toMatchObject({ ref: 1, role: 'button', name: 'Close dialog' })
    } finally {
      await session.close()
    }
  })
})
