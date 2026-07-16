// In the browser, index.html loads env.json into window.env before the app
// boots. Tests have no env.json, so seed window.env from Vite's import.meta.env
// (populated from .env.test). The node environment used by *.test.ts has no
// window, so define one first.
globalThis.window ??= globalThis as Window & typeof globalThis
window.env = { ...import.meta.env } as AppEnv
