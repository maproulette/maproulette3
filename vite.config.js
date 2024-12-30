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
  plugins: [react()],
  define: {
    __GIT_SHA__: JSON.stringify(execSync('git rev-parse HEAD').toString()),
    __GIT_TAG__: JSON.stringify(execSync('git describe --tags --exact-match 2>/dev/null || true').toString()),
  },
});
