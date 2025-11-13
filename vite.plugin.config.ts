import { resolve } from 'node:path'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Vite configuration for building plugins as standalone modules
 * Plugins built with this config can be loaded dynamically from URLs
 * 
 * Usage:
 * - Build all plugins: npm run build:plugins
 * - Build a specific plugin: vite build --config vite.plugin.config.ts --mode example-plugin
 * - Serve plugins: npm run serve:plugins (runs on port 3002)
 */
export default defineConfig(({ mode }) => {
  // Determine which plugin to build based on mode
  const pluginName = mode || 'example-plugin'
  const pluginEntry = resolve(__dirname, `src/plugins/examples/${pluginName === 'example-plugin' ? 'ExamplePlugin' : pluginName === 'analytics-plugin' ? 'AnalyticsPlugin' : 'ExamplePlugin'}.entry.tsx`)

  return {
    plugins: [viteReact()],
    
    build: {
      // Output to dist/plugins directory
      outDir: resolve(__dirname, 'dist/plugins'),
      
      // Build as a library
      lib: {
        entry: pluginEntry,
        name: pluginName,
        formats: ['es'], // ES module format for dynamic imports
        fileName: (format) => `${pluginName}.${format}.js`,
      },
      
      // Externalize dependencies that should not be bundled
      rollupOptions: {
        // external: [
        //   'react',
        //   'react-dom',
        //   'lucide-react',
        // ],
        output: {
          // Global variables for externalized dependencies
          // globals: {
          //   react: 'React',
          //   'react-dom': 'ReactDOM',
          //   'lucide-react': 'LucideReact',
          // },
          // Preserve module structure for better debugging
          preserveModules: false,
          // Add banner to identify the plugin
          banner: `/* MapRoulette Plugin: ${pluginName} */`,
        },
      },
      
      // Generate sourcemaps for debugging
      sourcemap: true,
      
      // Don't minify in development
      minify: mode === 'production',
      
      // Clear output directory before building
      emptyOutDir: false, // Don't clear to allow multiple plugin builds
    },
    
    // Development server for serving built plugins
    server: {
      port: 3002,
      host: true,
      cors: {
        origin: '*', // Allow all origins for plugin loading
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: true,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, PUT, PATCH, POST, DELETE',
        'Access-Control-Allow-Headers': '*',
      },
    },
    
    // Preview server configuration (for serving built plugins)
    preview: {
      port: 3002,
      host: true,
      cors: {
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: true,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, PUT, PATCH, POST, DELETE',
        'Access-Control-Allow-Headers': '*',
      },
    },
    
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  }
})

