import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { apply, Config, inject, name } from '../src/index.ts'

describe('dsh-browser-use plugin', () => {
  it('declares its plugin contract', () => {
    expect(name).toBe('browser-use')
    expect(inject).toContain('tools')
  })

  it('mounts into a Cordis context with the tools service and disposes cleanly', async () => {
    const ctx = new Context()
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    ctx.provide('attachments', {
      async saveImage() {
        return { attachmentId: 'sha256:test', mediaType: 'image/png', bytes: 1, width: 1, height: 1 }
      },
    })
    const fiber = await ctx.plugin({ name, inject, Config, apply }, {})
    expect(fiber).toBeDefined()
    await fiber.dispose()
  })
})
