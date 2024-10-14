import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000
  },
  envPrefix: 'REACT_APP_',
  plugins: [react()]
})

