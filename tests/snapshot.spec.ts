import { describe, expect, it } from 'vitest'
import { BrowserSession, formatSnapshot } from '../src/session.ts'

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

  it('captures ARIA widget roles and their state', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.page.setContent(`<html><body>
        <div role="listbox" aria-label="Trending dropdown">Trending dropdown</div>
        <div role="option" aria-selected="true">Rising</div>
        <div role="tab">Overview</div>
        <div role="menuitem">Save</div>
        <div role="checkbox" aria-checked="true">Enable</div>
      </body></html>`)
      const snap = await session.snapshot()
      const roles = snap.elements.map((e) => e.role)
      expect(roles).toEqual(expect.arrayContaining(['listbox', 'option', 'tab', 'menuitem', 'checkbox']))
      const listbox = snap.elements.find((e) => e.role === 'listbox')
      expect(listbox?.name).toBe('Trending dropdown')
      const opt = snap.elements.find((e) => e.role === 'option')
      expect(opt?.state).toBe('selected=true')
      const chk = snap.elements.find((e) => e.role === 'checkbox')
      expect(chk?.state).toBe('checked=true')
    } finally {
      await session.close()
    }
  })

  it('uses associated labels and aria-labelledby for names', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000 })
    try {
      await session.page.setContent(`<html><body>
        <label for="uname">Username</label><input id="uname">
        <span id="desc">Password hint</span><input aria-labelledby="desc">
      </body></html>`)
      const snap = await session.snapshot()
      const names = snap.elements.map((e) => e.name)
      expect(names).toContain('Username')
      expect(names).toContain('Password hint')
    } finally {
      await session.close()
    }
  })

  it('caps snapshot elements at maxElements and marks truncation', async () => {
    const session = await BrowserSession.create({ headless: true, timeoutMs: 15000, maxElements: 5 })
    try {
      await session.page.setContent(`<body>${Array.from({ length: 20 }, (_, i) => `<button>b${i}</button>`).join('')}</body>`)
      const snap = await session.snapshot()
      expect(snap.elements.length).toBe(5)
      expect(snap.truncated).toBe(true)
      expect(formatSnapshot(snap)).toContain('truncated')
    } finally {
      await session.close()
    }
  })
})
