import { execSync } from 'node:child_process'

/**
 * Parse a `reg query "HKCU\...\Internet Settings"` output into the proxy URL,
 * or `undefined` when the proxy is disabled (ProxyEnable=0) or absent.
 * Exported for unit testing.
 */
export function parseWindowsProxy(out: string): string | undefined {
  const enableMatch = out.match(/ProxyEnable\s+REG_DWORD\s+0x([0-9a-fA-F]+)/)
  if (enableMatch && parseInt(enableMatch[1], 16) === 0) return undefined
  const match = out.match(/ProxyServer\s+REG_SZ\s+(.+)/)
  const server = match?.[1]?.trim()
  if (!server) return undefined
  return server.includes('://') ? server : `http://${server}`
}

/**
 * Resolve the proxy server the browser should use, in priority order:
 * 1. explicit `configured` value,
 * 2. HTTP(S)_PROXY / ALL_PROXY environment variables,
 * 3. the Windows system proxy (HKCU Internet Settings), only when enabled.
 * Returns a URL like `http://127.0.0.1:7897`, or `undefined` for a direct connection.
 */
export function detectProxy(configured?: string): string | undefined {
  if (configured && configured.trim() !== '') return configured
  const env = process.env.HTTPS_PROXY
    ?? process.env.HTTP_PROXY
    ?? process.env.https_proxy
    ?? process.env.http_proxy
    ?? process.env.ALL_PROXY
    ?? process.env.all_proxy
  if (env) return env
  if (process.platform === 'win32') {
    try {
      const out = execSync(
        'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"',
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      )
      return parseWindowsProxy(out)
    } catch {
      /* no registry access, or no system proxy configured */
    }
  }
  return undefined
}
