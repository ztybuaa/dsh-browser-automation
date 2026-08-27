import { defineTool, type ToolDefinition } from '@deepseek-ai/dsh-tools'
import { BrowserSessionManager, formatSnapshot, type PageSnapshot } from './session.ts'

/** The canonical output shape shared by navigate and snapshot. */
const snapshotSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', required: true },
    url: { type: 'string', required: true },
    elements: {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ref: { type: 'number', required: true },
          role: { type: 'string', required: true },
          name: { type: 'string', required: true },
        },
      },
    },
  },
} as const

/** The canonical output shape for click/type acknowledgements. */
const okSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ok: { type: 'boolean', required: true },
    message: { type: 'string', required: true },
  },
} as const

function renderSnapshot(_args: unknown, value: PageSnapshot): { type: 'text'; text: string }[] {
  return [{ type: 'text', text: formatSnapshot(value) }]
}

function renderOk(_args: unknown, value: { message: string }): { type: 'text'; text: string }[] {
  return [{ type: 'text', text: value.message }]
}

/** Register the browser tools against a session manager. */
export function browserTools(manager: BrowserSessionManager): ToolDefinition[] {
  return [
    defineTool({
      name: 'browser_navigate',
      description: 'Open a URL in the browser and return an accessibility snapshot of the loaded page: title, URL, and indexed interactive elements.',
      parameters: {
        url: { type: 'string', required: true, description: 'The absolute URL to open' },
      },
      output: { schema: snapshotSchema, render: renderSnapshot },
      async execute(args, exec) {
        const session = await manager.requireSession(exec.agent)
        await session.navigate(args.url)
        return await session.snapshot()
      },
    }),
    defineTool({
      name: 'browser_snapshot',
      description: 'Return an accessibility snapshot of the current page: indexed interactive elements you can click or type into by their ref.',
      parameters: {},
      output: { schema: snapshotSchema, render: renderSnapshot },
      async execute(_args, exec) {
        const session = await manager.requireSession(exec.agent)
        return await session.snapshot()
      },
    }),
    defineTool({
      name: 'browser_click',
      description: 'Click the interactive element referenced by `ref` from the most recent snapshot.',
      parameters: {
        ref: { type: 'number', required: true, description: 'The 1-based ref of the element from the snapshot' },
      },
      output: { schema: okSchema, render: renderOk },
      async execute(args, exec) {
        const session = await manager.requireSession(exec.agent)
        await session.click(args.ref)
        return { ok: true, message: `clicked ref ${args.ref}` }
      },
    }),
    defineTool({
      name: 'browser_type',
      description: 'Type text into the input referenced by `ref` from the most recent snapshot.',
      parameters: {
        ref: { type: 'number', required: true, description: 'The 1-based ref of the input from the snapshot' },
        text: { type: 'string', required: true, description: 'The text to type' },
      },
      output: { schema: okSchema, render: renderOk },
      async execute(args, exec) {
        const session = await manager.requireSession(exec.agent)
        await session.type(args.ref, args.text)
        return { ok: true, message: `typed into ref ${args.ref}` }
      },
    }),
    defineTool({
      name: 'browser_press_key',
      description: 'Press a keyboard key on the current page (e.g. Enter to submit a form, Escape to close a modal, Tab to move focus).',
      parameters: {
        key: { type: 'string', required: true, description: 'The key to press, e.g. Enter, Escape, Tab, ArrowDown' },
      },
      output: { schema: okSchema, render: renderOk },
      async execute(args, exec) {
        const session = await manager.requireSession(exec.agent)
        await session.pressKey(args.key)
        return { ok: true, message: `pressed ${args.key}` }
      },
    }),
  ]
}
