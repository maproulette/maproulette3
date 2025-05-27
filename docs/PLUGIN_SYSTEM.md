# MapRoulette Plugin System

This document outlines the current plugin system architecture and provides guidance on integrating plugins with Vite.

## Current Architecture

The plugin system consists of four main components:

1. **PluginService**: Core service for managing plugin lifecycle
2. **PluginContainer**: React component for rendering plugin components
3. **PluginManager**: UI for managing plugin state
4. **PluginInjectionPoint**: Component for defining where plugins can be rendered in the application

### PluginService

The `PluginService` handles:
- Plugin registration
- Dynamic loading/unloading
- State persistence
- Plugin lifecycle management

```javascript
// Example plugin registration
pluginService.registerPlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  entryPoint: '/path/to/plugin',
  version: '1.0.0',
  description: 'Plugin description'
});
```

### PluginContainer

The `PluginContainer` component:
- Loads plugin components dynamically
- Handles loading states
- Manages error boundaries
- Passes props to plugin components

```jsx
<PluginContainer 
  pluginId="my-plugin" 
  componentName="MyComponent" 
  someProp="value" 
/>
```

### PluginManager

The `PluginManager` provides:
- UI for enabling/disabling plugins
- Plugin information display
- Error handling
- State management

### PluginInjectionPoint

The `PluginInjectionPoint` component:
- Defines locations in the application where plugins can be rendered
- Manages dynamic plugin loading at specific points
- Handles plugin updates and re-rendering
- Provides a consistent interface for plugin placement

```jsx
// Example usage in a page or component
<PluginInjectionPoint 
  point="header" 
  additionalProps="value" 
/>
```

```javascript
// Example plugin registration with injection points
pluginService.registerPlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  entryPoint: '/path/to/plugin',
  version: '1.0.0',
  description: 'Plugin description',
  injectionPoints: ['header', 'sidebar'] // Define where this plugin can be rendered
});
```

## Vite Integration

Vite provides several features that enhance the plugin system:

### 1. Dynamic Imports

Vite's dynamic imports are more efficient than traditional webpack imports:

```javascript
// In PluginService.js
const module = await import(/* @vite-ignore */ plugin.entryPoint);
```

### 2. Module Federation

Module Federation allows you to dynamically load remote modules at runtime, enabling true micro-frontend architecture. This is particularly useful for plugins as it allows them to be developed and deployed independently.

#### Understanding Module Federation

### The Federation Function

The `federation` function is a Vite plugin that implements Module Federation, a webpack 5 feature that allows you to dynamically load code from other applications at runtime. Here's how it works:

```javascript
federation({
  // The name of your application
  name: 'maproulette',
  
  // Define remote modules (plugins) that can be loaded
  remotes: {
    'my-plugin-1': {
      // URL where the plugin's remoteEntry.js can be found
      external: `Promise.resolve('http://localhost:5001/remoteEntry.js')`,
      // Format of the module (ES modules)
      format: 'esm',
      // Indicates this is a Vite-built module
      from: 'vite'
    }
  },
  
  // Dependencies that should be shared between host and plugins
  shared: ['react', 'react-dom']
})
```

### How It Works

1. **Remote Entry File**
   - Each plugin builds a `remoteEntry.js` file
   - This file acts as a manifest of what the plugin exposes
   - Contains information about shared dependencies

2. **Runtime Loading**
   - When your app requests a plugin component:
   ```javascript
   const Plugin = await import('my-plugin-1/Plugin')
   ```
   - The federation plugin:
     1. Fetches the remote entry file
     2. Checks for shared dependencies
     3. Loads the plugin code
     4. Integrates it with your application

3. **Dependency Sharing**
   - Common dependencies (like React) are shared
   - Only one copy of React is loaded
   - All plugins use the same React instance
   - Prevents version conflicts and reduces bundle size

### Example Flow

1. **Plugin Build**
```javascript
// Plugin's vite.config.js
federation({
  name: 'my-plugin-1',
  filename: 'remoteEntry.js',
  exposes: {
    // This is what the host app can import
    './Plugin': './src/index.js'
  },
  shared: ['react', 'react-dom']
})
```

2. **Host Application**
```javascript
// MapRoulette's vite.config.js
federation({
  name: 'maproulette',
  remotes: {
    'my-plugin-1': {
      external: `Promise.resolve('http://localhost:5001/remoteEntry.js')`,
      format: 'esm',
      from: 'vite'
    }
  },
  shared: ['react', 'react-dom']
})
```

3. **Runtime Loading**
```javascript
// When your app needs the plugin
const module = await import('my-plugin-1/Plugin')
```

### What Happens Behind the Scenes

1. **Initial Load**
   - Host application loads
   - Federation plugin initializes
   - Shared dependencies are loaded

2. **Plugin Request**
   - App requests plugin component
   - Federation plugin checks remote entry
   - Verifies shared dependencies
   - Loads plugin code

3. **Integration**
   - Plugin code is executed
   - Shared dependencies are used
   - Component is rendered

### Benefits

1. **Runtime Integration**
   - Plugins can be loaded without rebuilding
   - Changes to plugins are immediately available
   - Better development experience

2. **Dependency Management**
   - Shared dependencies are managed automatically
   - No duplicate loading of common libraries
   - Consistent versions across the application

3. **Performance**
   - Code splitting is handled automatically
   - Only needed code is loaded
   - Shared dependencies are cached

### Common Configuration Options

```javascript
federation({
  // Required: Unique name for your application
  name: 'maproulette',
  
  // Required: Define remote modules
  remotes: {
    'plugin-name': {
      // Required: URL to remoteEntry.js
      external: `Promise.resolve('http://localhost:5001/remoteEntry.js')`,
      // Required: Module format
      format: 'esm',
      // Required: Build tool
      from: 'vite'
    }
  },
  
  // Optional: Dependencies to share
  shared: ['react', 'react-dom'],
  
  // Optional: Additional configuration
  options: {
    // Enable strict version checking
    strictVersion: true,
    // Force singleton instances
    singleton: true,
    // Required version range
    requiredVersion: '^17.0.0'
  }
})
```

## Plugin Integration Methods

### 1. Local Development

Using git submodules:
```bash
# Add plugin as a submodule
git submodule add https://github.com/org/plugin-repo.git plugins/plugin-name
```

Vite configuration:
```javascript
// vite.config.js
export default defineConfig({
  resolve: {
    alias: {
      '@plugins': '/plugins'
    }
  }
})
```

### 3. Remote Plugin Hosting

Load plugins from external sources. There are several ways to specify the plugin location:

#### GitHub Raw Content
```javascript
// PluginService.js
pluginService.registerPlugin({
  id: 'github-plugin',
  name: 'GitHub Plugin',
  // Points to the raw content of the built plugin file
  entryPoint: 'https://raw.githubusercontent.com/org/plugin-repo/main/dist/index.js',
  version: '1.0.0'
});
```

#### CDN Hosted
```javascript
pluginService.registerPlugin({
  id: 'cdn-plugin',
  name: 'CDN Plugin',
  // Points to a CDN-hosted version of the plugin
  entryPoint: 'https://cdn.example.com/plugins/my-plugin/v1.0.0/index.js',
  version: '1.0.0'
});
```

#### Self-Hosted
```javascript
pluginService.registerPlugin({
  id: 'self-hosted-plugin',
  name: 'Self-Hosted Plugin',
  // Points to your own server
  entryPoint: 'https://plugins.maproulette.org/my-plugin/index.js',
  version: '1.0.0'
});
```

#### Plugin Loading Implementation
```javascript
// PluginService.js
async loadPlugin(pluginId) {
  const plugin = this.plugins.get(pluginId);
  if (!plugin) {
    throw new Error(`Plugin ${pluginId} not found`);
  }

  try {
    // The entryPoint should be a URL to the built JavaScript file
    const module = await import(/* @vite-ignore */ plugin.entryPoint);
    
    if (!module.initialize || typeof module.initialize !== 'function') {
      throw new Error(`Plugin ${pluginId} does not export an initialize function`);
    }

    const pluginInstance = await module.initialize({
      React,
      // Add any other context needed by plugins
    });

    this.loadedPlugins.set(pluginId, {
      ...plugin,
      instance: pluginInstance
    });

    return this.loadedPlugins.get(pluginId);
  } catch (error) {
    console.error(`Failed to load plugin ${pluginId}:`, error);
    throw error;
  }
}
```

#### Plugin Structure
The plugin's entry point (index.js) should be built and hosted as a single JavaScript file that exports an initialize function:

```javascript
// Example plugin entry point (index.js)
import React from 'react';

export const initialize = async (context) => {
  return {
    components: {
      MyComponent: () => <div>My Plugin Component</div>
    },
    // Optional cleanup function
    cleanup: () => {
      // Cleanup code here
    }
  };
};
```

#### Building for Distribution
Plugins should be built before distribution. Example build configuration:

```javascript
// vite.config.js in the plugin repository
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
```

After building, the plugin should be:
1. Hosted on a CDN, GitHub releases, or your own server
2. The URL should point to the built JavaScript file
3. The file should be served with the correct MIME type (application/javascript)
4. CORS headers should be properly configured if hosted on a different domain

## Local Development with Local Plugins

### Setting Up Local Development

1. **Project Structure**
```
maproulette3/
├── src/
├── plugins/
│   ├── my-plugin-1/
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.js
│   └── my-plugin-2/
│       ├── src/
│       ├── package.json
│       └── vite.config.js
└── vite.config.js
```

2. **Main Application Configuration**
```javascript
// vite.config.js in MapRoulette root
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'maproulette',
      remotes: {
        'my-plugin-1': {
          external: `Promise.resolve('http://localhost:5001/remoteEntry.js')`,
          format: 'esm',
          from: 'vite'
        },
        'my-plugin-2': {
          external: `Promise.resolve('http://localhost:5002/remoteEntry.js')`,
          format: 'esm',
          from: 'vite'
        }
      },
      shared: ['react', 'react-dom']
    })
  ],
  server: {
    port: 3000
  }
})
```

3. **Plugin Configuration**
```javascript
// vite.config.js in each plugin directory
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'my-plugin-1', // unique name for each plugin
      filename: 'remoteEntry.js',
      exposes: {
        './Plugin': './src/index.js'
      },
      shared: ['react', 'react-dom']
    })
  ],
  server: {
    port: 5001, // unique port for each plugin
    cors: true
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'esm',
        entryFileNames: 'remoteEntry.js'
      }
    }
  }
})
```

4. **Development Scripts**
```json
// package.json in MapRoulette root
{
  "scripts": {
    "dev": "vite",
    "dev:plugins": "concurrently \"cd plugins/my-plugin-1 && npm run dev\" \"cd plugins/my-plugin-2 && npm run dev\"",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:plugins\""
  }
}
```

5. **Plugin Registration for Local Development**
```javascript
// src/services/PluginService.js
const localPlugins = [
  {
    id: 'my-plugin-1',
    name: 'My Plugin 1',
    entryPoint: 'my-plugin-1/Plugin',
    version: '1.0.0',
    development: true
  },
  {
    id: 'my-plugin-2',
    name: 'My Plugin 2',
    entryPoint: 'my-plugin-2/Plugin',
    version: '1.0.0',
    development: true
  }
];

// Register local plugins in development
if (process.env.NODE_ENV === 'development') {
  localPlugins.forEach(plugin => {
    pluginService.registerPlugin(plugin);
  });
}
```

### Running the Development Environment

1. **Start All Services**
```bash
# In the MapRoulette root directory
npm run dev:all
```

This will start:
- MapRoulette on http://localhost:3000
- Plugin 1 on http://localhost:5001
- Plugin 2 on http://localhost:5002

2. **Development Workflow**
- Changes to the main application will hot-reload
- Changes to plugins will hot-reload
- All services can be debugged simultaneously

### Debugging

1. **Chrome DevTools**
- Use the Network tab to monitor plugin loading
- Check the Console for any federation-related errors
- Use the Sources tab to debug plugin code

2. **Vite Dev Server**
- Access Vite's dev server UI at http://localhost:3000/__vite/
- Monitor build times and dependencies
- Check for any build errors

### Common Issues and Solutions

1. **CORS Errors**
```javascript
// Add to plugin's vite.config.js
server: {
  cors: true,
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
}
```

2. **Port Conflicts**
- Ensure each plugin uses a unique port
- Update the main application's federation config accordingly

3. **Hot Module Replacement**
- Ensure all services are running
- Check that the plugin's HMR is properly configured
- Verify that the main application is watching for plugin changes

### Production Build

When building for production, you'll need to:

1. Build each plugin:
```bash
cd plugins/my-plugin-1
npm run build
```

2. Update the federation configuration with production URLs:
```javascript
// vite.config.js
federation({
  remotes: {
    'my-plugin-1': {
      external: `Promise.resolve('https://your-cdn.com/plugins/my-plugin-1/remoteEntry.js')`,
      format: 'esm',
      from: 'vite'
    }
  }
})
```

## Getting Started

1. Create a new plugin:
```bash
# Using the plugin template
git clone https://github.com/maproulette/plugin-template.git my-plugin
cd my-plugin
npm install
```

2. Develop your plugin:
```javascript
// src/index.js
export const initialize = async (context) => {
  return {
    components: {
      MyComponent: () => <div>My Plugin Component</div>
    }
  };
};
```

3. Build and test:
```bash
npm run build
npm run test
```

4. Integrate with MapRoulette:
```javascript
// Register the plugin
pluginService.registerPlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  entryPoint: '/path/to/plugin',
  version: '1.0.0'
});
```
