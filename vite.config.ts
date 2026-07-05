import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { loadEnv, type Plugin } from 'vite'
import svgr from 'vite-plugin-svgr'
import { defineConfig } from 'vitest/config'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8')) as {
  version: string
}

// Emits the VITE_* settings to env.json so they can be loaded into window.env at
// runtime (see index.html). In dev mode, env.json is generated from the user's
// local .env file. For release builds, env.json is written to dist/ and contains
// defaults (from .env.example) which can be overridden at deploy time (e.g. via
// env vars on the Docker container; see docker/90-write-env-to-json.sh)
function runtimeEnv(): Plugin {
  let json: string
  return {
    name: 'maproulette:runtime-env',
    configResolved(config) {
      json = JSON.stringify(loadEnv(config.mode, config.root, 'VITE_'), null, 2)
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/env.json') return next()
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(json)
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'env.json', source: json })
    },
  }
}

function pluginMiddleware(distDir: string) {
  return (
    req: { url?: string },
    res: { setHeader: (k: string, v: string) => void; end: (body: Buffer) => void },
    next: () => void
  ) => {
    if (!req.url?.startsWith('/plugins/')) return next()
    const filePath = resolve(distDir, req.url.slice(1))
    if (!filePath.startsWith(distDir)) return next()
    if (!existsSync(filePath)) return next()
    const content = readFileSync(filePath)
    res.setHeader('Content-Type', 'application/javascript')
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.end(content)
  }
}

function servePlugins(): Plugin {
  let distDir: string
  return {
    name: 'maproulette:serve-plugins',
    configResolved(config) {
      distDir = resolve(config.root, config.build.outDir)
    },
    configureServer(server) {
      server.middlewares.use(pluginMiddleware(distDir))
    },
    configurePreviewServer(server) {
      server.middlewares.use(pluginMiddleware(distDir))
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svgr(),
    tailwindcss(),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    viteReact(),
    runtimeEnv(),
    servePlugins(),
  ],
  build: {
    sourcemap: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  preview: {
    port: 3001,
    host: true,
  },
  server: {
    port: 3001,
    host: true,
  },
  test: {
    setupFiles: ['./src/test/setup.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'component',
          include: ['src/**/*.test.tsx'],
          environment: 'happy-dom',
        },
      },
    ],
  },
})
