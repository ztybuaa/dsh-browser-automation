import { execSync } from 'node:child_process'

/**
 * Resolve the proxy server the browser should use, in priority order:
 * 1. explicit `configured` value,
 * 2. HTTP(S)_PROXY / ALL_PROXY environment variables,
 * 3. the Windows system proxy (HKCU Internet Settings).
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
        'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer',
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      )
      const match = out.match(/ProxyServer\s+REG_SZ\s+(.+)/)
      const server = match?.[1]?.trim()
      if (!server) return undefined
      return server.includes('://') ? server : `http://${server}`
    } catch {
      /* no registry access, or no system proxy configured */
    }
  }
  return undefined
}
