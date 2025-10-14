/** biome-ignore-all lint/correctness/noUnusedVariables: <https://vite.dev/guide/env-and-mode.html#intellisense-for-typescript> */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_API_BASE_URL: string | undefined
  readonly VITE_MAP_ROULETTE_SERVER_WEBSOCKET_URL: string
  readonly VITE_SERVER_OAUTH_URL: string
  readonly VITE_SERVER_API_KEY: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
