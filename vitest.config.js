import { defineConfig, mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

import viteConfig from './vite.config.js';

// https://vitest.dev/config/
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['src/setupTests.jsx'],
    },
  }),
);
