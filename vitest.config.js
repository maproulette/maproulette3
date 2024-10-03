import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [
      "src/setupTests.jsx",
    ],
  },
  plugins: [
    react(),
  ],
});
