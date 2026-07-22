// In the browser, index.html loads env.json into window.env before the app
// boots. Tests have no env.json, so seed window.env from Vite's import.meta.env
// (populated from .env.test). The node environment used by *.test.ts has no
// window, so define one first.
globalThis.window ??= globalThis as Window & typeof globalThis
window.env = { ...import.meta.env } as AppEnv

// The node environment used by *.test.ts predates Node's global File (added in
// Node 20); pull it in from node:buffer so File-based tests can run on Node 18.
if (typeof globalThis.File === 'undefined') {
  const { File } = await import('node:buffer')
  globalThis.File = File as unknown as typeof globalThis.File
}
