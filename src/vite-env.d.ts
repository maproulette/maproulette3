/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_API_BASE_URL: string | undefined
  readonly VITE_MAP_ROULETTE_SERVER_WEBSOCKET_URL: string
  readonly VITE_SERVER_OAUTH_URL: string
  readonly VITE_SERVER_API_KEY: string | undefined
  readonly VITE_GITHUB_ISSUES_API_OWNER: string | undefined
  readonly VITE_GITHUB_ISSUES_API_REPO: string | undefined
  readonly VITE_GITHUB_ISSUES_API_TOKEN: string | undefined
  readonly VITE_APP_URL: string | undefined
  readonly VITE_OSM_SERVER: string | undefined
  readonly VITE_OSM_API_SERVER: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
