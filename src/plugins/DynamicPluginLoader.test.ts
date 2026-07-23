// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Plugin } from '@/types/Plugin'
import {
  fetchPluginManifest,
  loadPluginFromUrl,
  loadPluginsFromManifests,
  loadPluginViaScript,
  type RemotePluginManifest,
  validatePluginManifest,
} from './DynamicPluginLoader'

const globalWindow = window as unknown as Record<string, unknown>

// happy-dom's HTMLScriptElement drives its own load/error lifecycle as soon as
// it is connected to the document (JS evaluation is disabled by default, so it
// synchronously fires an "error" event on append). That races with the source
// module's own onload/onerror wiring, so appendChild/removeChild are replaced
// here with plain bookkeeping - the created <script> node is still a real DOM
// node (so `.src`/`.async`/`.crossOrigin` reads work), it just never actually
// connects to the document, letting the tests drive onload/onerror manually.
let appendedScripts: HTMLScriptElement[] = []

const lastScript = (): HTMLScriptElement => appendedScripts[appendedScripts.length - 1]

beforeEach(() => {
  appendedScripts = []
  vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
    appendedScripts.push(node as HTMLScriptElement)
    return node
  })
  vi.spyOn(document.head, 'removeChild').mockImplementation((node) => {
    appendedScripts = appendedScripts.filter((script) => script !== node)
    return node
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('loadPluginViaScript', () => {
  it.each([
    ['directly', 'direct', 'p1', 'Plugin One', 'DirectPlugin'],
    ['wrapped in a default export', 'default', 'p2', 'Plugin Two', 'DefaultWrapped'],
    ['wrapped under a `plugin` key', 'plugin', 'p3', 'Plugin Three', 'PluginWrapped'],
  ] as const)(
    'resolves with the plugin when window[globalName] exposes it %s',
    async (_label, kind, id, name, globalName) => {
      const plugin: Plugin = { metadata: { id, name, description: '', version: '1.0' } }
      const promise = loadPluginViaScript(`https://example.com/${id}.js`, globalName)
      globalWindow[globalName] =
        kind === 'default' ? { default: plugin } : kind === 'plugin' ? { plugin } : plugin
      lastScript().onload?.(new Event('load'))

      await expect(promise).resolves.toEqual({ success: true, plugin })
    }
  )

  it('prefers `default` over `plugin` when both are present', async () => {
    const defaultPlugin: Plugin = {
      metadata: { id: 'default', name: 'Default', description: '', version: '1.0' },
    }
    const otherPlugin: Plugin = {
      metadata: { id: 'other', name: 'Other', description: '', version: '1.0' },
    }
    const promise = loadPluginViaScript('https://example.com/p4.js', 'BothWrapped')
    globalWindow.BothWrapped = { default: defaultPlugin, plugin: otherPlugin }
    lastScript().onload?.(new Event('load'))

    await expect(promise).resolves.toEqual({ success: true, plugin: defaultPlugin })
  })

  it('fails when nothing is exposed at window[globalName]', async () => {
    const promise = loadPluginViaScript('https://example.com/missing.js', 'MissingGlobal')
    lastScript().onload?.(new Event('load'))

    await expect(promise).resolves.toEqual({
      success: false,
      error: 'Plugin not found at window["MissingGlobal"]',
    })
    expect(appendedScripts).toHaveLength(0)
  })

  it.each([
    ['is neither an object nor wrapped in default/plugin', 'PrimitiveGlobal', 'not-a-plugin'],
    ['has both default and plugin wrappers absent', 'EmptyObjectGlobal', {}],
  ] as const)('fails when the exposed value %s', async (_label, globalName, value) => {
    const promise = loadPluginViaScript(`https://example.com/${globalName}.js`, globalName)
    globalWindow[globalName] = value
    lastScript().onload?.(new Event('load'))

    await expect(promise).resolves.toEqual({
      success: false,
      error: `Plugin not found at window["${globalName}"]`,
    })
  })

  it.each([
    ['has no metadata at all', 'NoMetadataGlobal', { metadata: undefined }],
    ['metadata is missing an id', 'NoIdGlobal', { metadata: { name: 'Has Name' } }],
    ['metadata is missing a name', 'NoNameGlobal', { metadata: { id: 'has-id' } }],
  ] as const)('fails when the plugin %s', async (_label, globalName, value) => {
    const promise = loadPluginViaScript(`https://example.com/${globalName}.js`, globalName)
    globalWindow[globalName] = value
    lastScript().onload?.(new Event('load'))

    await expect(promise).resolves.toEqual({
      success: false,
      error: 'Plugin is missing required metadata (id, name)',
    })
  })

  it('resolves with an error and removes the script when reading window[globalName] throws an Error', async () => {
    const promise = loadPluginViaScript('https://example.com/throws.js', 'ThrowingGlobal')
    Object.defineProperty(window, 'ThrowingGlobal', {
      configurable: true,
      get() {
        throw new Error('boom')
      },
    })
    lastScript().onload?.(new Event('load'))

    await expect(promise).resolves.toEqual({ success: false, error: 'boom' })
    expect(appendedScripts).toHaveLength(0)

    Object.defineProperty(window, 'ThrowingGlobal', { configurable: true, value: undefined })
  })

  it('resolves with a generic message when a non-Error value is thrown', async () => {
    const promise = loadPluginViaScript(
      'https://example.com/throwsstring.js',
      'ThrowingStringGlobal'
    )
    Object.defineProperty(window, 'ThrowingStringGlobal', {
      configurable: true,
      get() {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw 'not-an-error'
      },
    })
    lastScript().onload?.(new Event('load'))

    await expect(promise).resolves.toEqual({ success: false, error: 'Failed to load plugin' })

    Object.defineProperty(window, 'ThrowingStringGlobal', { configurable: true, value: undefined })
  })

  it('resolves with an error and removes the script when the script fails to load', async () => {
    const promise = loadPluginViaScript('https://example.com/error.js', 'ErrorGlobal')
    lastScript().onerror?.(new Event('error'))

    await expect(promise).resolves.toEqual({
      success: false,
      error: 'Failed to load plugin script',
    })
    expect(appendedScripts).toHaveLength(0)
  })

  it('configures the script element with the given URL, async and crossOrigin attributes', () => {
    loadPluginViaScript('https://example.com/config.js', 'ConfigGlobal')
    const script = lastScript()

    expect(script.src).toBe('https://example.com/config.js')
    expect(script.async).toBe(true)
    expect(script.crossOrigin).toBe('anonymous')
  })
})

describe('loadPluginFromUrl', () => {
  it('rejects non-http(s) protocols without touching the DOM', async () => {
    const result = await loadPluginFromUrl('ftp://example.com/plugin.js')

    expect(result).toEqual({ success: false, error: 'Only HTTP(S) URLs are supported' })
    expect(appendedScripts).toHaveLength(0)
  })

  it('returns an error result for a malformed URL instead of throwing', async () => {
    const result = await loadPluginFromUrl('not a valid url')

    expect(result.success).toBe(false)
    expect(typeof result.error).toBe('string')
  })

  it('returns a generic message when a non-Error value is thrown while parsing the URL', async () => {
    // Must be a constructible function (the source calls `new URL(...)`), so this can't be an arrow function.
    function ThrowingUrl() {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 'not-an-error'
    }
    vi.stubGlobal('URL', ThrowingUrl)

    const result = await loadPluginFromUrl('https://example.com/a.js')

    expect(result).toEqual({ success: false, error: 'Failed to load plugin module' })
    vi.unstubAllGlobals()
  })

  it('derives the global name from the URL filename and delegates to script loading', async () => {
    const plugin: Plugin = {
      metadata: { id: 'derived', name: 'Derived', description: '', version: '1.0' },
    }
    const promise = loadPluginFromUrl('https://example.com/path/derivedGlobal.js')
    globalWindow.derivedGlobal = plugin
    lastScript().onload?.(new Event('load'))

    await expect(promise).resolves.toEqual({ success: true, plugin })
  })

  it('falls back to an empty global name when the URL has no filename segment', async () => {
    const result = loadPluginFromUrl('https://example.com/')
    lastScript().onload?.(new Event('load'))

    await expect(result).resolves.toEqual({
      success: false,
      error: 'Plugin not found at window[""]',
    })
  })
})

describe('loadPluginsFromManifests', () => {
  it('returns an empty map for an empty manifest list', async () => {
    const result = await loadPluginsFromManifests([])
    expect(result).toEqual(new Map())
  })

  it('loads each manifest and keys the results by manifest id', async () => {
    const manifests: RemotePluginManifest[] = [
      { id: 'one', name: 'One', moduleUrl: 'ftp://example.com/one.js', version: '1.0' },
      { id: 'two', name: 'Two', moduleUrl: 'ftp://example.com/two.js', version: '1.0' },
    ]

    const result = await loadPluginsFromManifests(manifests)

    expect(result.size).toBe(2)
    expect(result.get('one')).toEqual({ success: false, error: 'Only HTTP(S) URLs are supported' })
    expect(result.get('two')).toEqual({ success: false, error: 'Only HTTP(S) URLs are supported' })
  })
})

describe('validatePluginManifest', () => {
  it('accepts a manifest with all required string fields', () => {
    expect(
      validatePluginManifest({
        id: 'a',
        name: 'A',
        moduleUrl: 'https://x.com/a.js',
        version: '1.0',
      })
    ).toBe(true)
  })

  it('rejects null', () => {
    expect(validatePluginManifest(null)).toBe(false)
  })

  it('rejects non-object values', () => {
    expect(validatePluginManifest('a string')).toBe(false)
    expect(validatePluginManifest(42)).toBe(false)
  })

  it.each([
    ['id', { name: 'A', moduleUrl: 'https://x.com/a.js', version: '1.0' }],
    ['name', { id: 'a', moduleUrl: 'https://x.com/a.js', version: '1.0' }],
    ['moduleUrl', { id: 'a', name: 'A', version: '1.0' }],
    ['version', { id: 'a', name: 'A', moduleUrl: 'https://x.com/a.js' }],
  ] as const)('rejects a manifest missing %s', (_field, manifest) => {
    expect(validatePluginManifest(manifest)).toBe(false)
  })
})

describe('fetchPluginManifest', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the parsed manifest when the response is a valid manifest', async () => {
    const manifest = { id: 'a', name: 'A', moduleUrl: 'https://x.com/a.js', version: '1.0' }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(manifest), { status: 200 }))
    )

    await expect(fetchPluginManifest('https://x.com/manifest.json')).resolves.toEqual(manifest)
  })

  it('returns null when the response body is not a valid manifest', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ foo: 'bar' }), { status: 200 }))
    )

    await expect(fetchPluginManifest('https://x.com/manifest.json')).resolves.toBeNull()
  })

  it('returns null when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 500 }))
    )

    await expect(fetchPluginManifest('https://x.com/manifest.json')).resolves.toBeNull()
  })

  it('returns null when fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      })
    )

    await expect(fetchPluginManifest('https://x.com/manifest.json')).resolves.toBeNull()
  })
})
