import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAllowedPluginHosts, validatePluginUrl, validatePluginUrls } from './pluginSecurity'

// import.meta.env.DEV defaults to true under vitest, so the module-level
// ALLOWED_PLUGIN_HOSTS list (built at import time) includes localhost/127.0.0.1
// unless a test explicitly stubs DEV to false and re-imports the module fresh.
afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('validatePluginUrl (DEV mode)', () => {
  it.each([
    [
      'allows an https URL on an exactly-matched allowed host',
      'https://github.com/org/repo/plugin.js',
      true,
    ],
    [
      'allows an https URL on a subdomain of an allowed host',
      'https://cdn.maproulette.org/plugin.js',
      true,
    ],
    ['rejects an https URL on a host not in the allowlist', 'https://evil.com/plugin.js', false],
    ['allows http on localhost since DEV is enabled', 'http://localhost:3000/plugin.js', true],
    ['allows http on 127.0.0.1 since DEV is enabled', 'http://127.0.0.1:3000/plugin.js', true],
    [
      'rejects http on a non-localhost host even in DEV mode',
      'http://example.com/plugin.js',
      false,
    ],
    ['rejects a non-http(s) protocol', 'ftp://github.com/plugin.js', false],
    ['rejects a malformed URL', 'not a valid url', false],
  ] as const)('%s', (_label, url, expected) => {
    expect(validatePluginUrl(url)).toBe(expected)
  })
})

describe('validatePluginUrl (production mode)', () => {
  it('excludes localhost from the allowlist and rejects http entirely', async () => {
    vi.stubEnv('DEV', false)
    vi.resetModules()
    const mod = await import('./pluginSecurity')

    expect(mod.validatePluginUrl('http://localhost:3000/plugin.js')).toBe(false)
    expect(mod.getAllowedPluginHosts()).not.toContain('localhost')
    expect(mod.getAllowedPluginHosts()).not.toContain('127.0.0.1')
  })

  it('still allows https URLs on allowed hosts', async () => {
    vi.stubEnv('DEV', false)
    vi.resetModules()
    const mod = await import('./pluginSecurity')

    expect(mod.validatePluginUrl('https://unpkg.com/plugin.js')).toBe(true)
  })
})

describe('validatePluginUrls', () => {
  it('splits URLs into valid and invalid buckets', () => {
    const result = validatePluginUrls([
      'https://github.com/plugin.js',
      'https://evil.com/plugin.js',
      'https://cdn.jsdelivr.net/plugin.js',
    ])

    expect(result.valid).toEqual([
      'https://github.com/plugin.js',
      'https://cdn.jsdelivr.net/plugin.js',
    ])
    expect(result.invalid).toEqual(['https://evil.com/plugin.js'])
  })

  it('returns an empty invalid array when every URL is valid', () => {
    const result = validatePluginUrls(['https://github.com/plugin.js'])

    expect(result.valid).toEqual(['https://github.com/plugin.js'])
    expect(result.invalid).toEqual([])
  })

  it('returns an empty valid array when every URL is invalid', () => {
    const result = validatePluginUrls(['https://evil.com/plugin.js'])

    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual(['https://evil.com/plugin.js'])
  })

  it('handles an empty input array', () => {
    expect(validatePluginUrls([])).toEqual({ valid: [], invalid: [] })
  })
})

describe('getAllowedPluginHosts', () => {
  it('returns the list of allowed hosts including dev-only hosts', () => {
    const hosts = getAllowedPluginHosts()
    expect(hosts).toContain('maproulette.org')
    expect(hosts).toContain('localhost')
  })
})
