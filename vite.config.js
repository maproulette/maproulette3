import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

import { execSync } from 'node:child_process';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    sourcemap: true,
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
  resolve: {
    alias: [
      // React 17 ships no "exports" map, so bare "react/jsx-runtime" fails
      // strict ESM resolution for packages (e.g. @floating-ui/react) that
      // use the automatic JSX runtime. Exact-match only, so it can't collide
      // with unrelated subpaths the way a plain-object alias would.
      { find: /^react\/jsx-runtime$/, replacement: 'react/jsx-runtime.js' },
      { find: /^react\/jsx-dev-runtime$/, replacement: 'react/jsx-dev-runtime.js' },
    ],
  },
  plugins: [react()],
  define: {
    __GIT_SHA__: JSON.stringify(execSync('git rev-parse HEAD').toString()),
    __GIT_TAG__: JSON.stringify(execSync('git describe --tags --exact-match 2>/dev/null || true').toString()),
  },
  test: {
    exclude: ['**/playwright/**', '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/playwright/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.*',
        '**/*.spec.*'
      ]
    }
  },
});
