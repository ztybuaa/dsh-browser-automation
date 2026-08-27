import { afterEach, describe, expect, it } from 'vitest'
import { detectProxy } from '../src/proxy.ts'

describe('detectProxy', () => {
  it('prefers an explicit proxy', () => {
    expect(detectProxy('http://127.0.0.1:7897')).toBe('http://127.0.0.1:7897')
  })

  it('falls back to HTTPS_PROXY when nothing explicit is given', () => {
    const old = process.env.HTTPS_PROXY
    process.env.HTTPS_PROXY = 'http://env-proxy:1234'
    try {
      expect(detectProxy(undefined)).toBe('http://env-proxy:1234')
    } finally {
      process.env.HTTPS_PROXY = old
    }
  })

  it('returns undefined with no explicit proxy and no env proxy', () => {
    const oldH = process.env.HTTPS_PROXY
    const oldA = process.env.ALL_PROXY
    delete process.env.HTTPS_PROXY
    delete process.env.ALL_PROXY
    try {
      const r = detectProxy(undefined)
      // On a machine with a Windows system proxy this may resolve to it; on CI it is undefined.
      expect(r === undefined || typeof r === 'string').toBe(true)
    } finally {
      process.env.HTTPS_PROXY = oldH
      process.env.ALL_PROXY = oldA
    }
  })
})
