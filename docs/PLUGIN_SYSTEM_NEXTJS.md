# MapRoulette Plugin System (Next.js Version)

This document outlines how to implement the plugin system using Next.js.

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

## Next.js Integration

Next.js provides several features that enhance the plugin system:

### 1. Dynamic Imports

Next.js's dynamic imports with SSR support:

```javascript
// In PluginService.js
import dynamic from 'next/dynamic'

const loadPlugin = async (pluginId) => {
  const plugin = plugins.get(pluginId)
  try {
    const module = await dynamic(() => import(/* @next-ignore */ plugin.entryPoint), {
      ssr: false // Disable SSR for plugins
    })
    return module
  } catch (error) {
    console.error(`Failed to load plugin ${pluginId}:`, error)
    throw error
  }
}
```

### 2. Module Federation with Next.js

Using `@module-federation/nextjs-mf` for Module Federation:

```javascript
// next.config.js
const { NextFederationPlugin } = require('@module-federation/nextjs-mf')

module.exports = {
  webpack: (config, options) => {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'maproulette',
        remotes: {
          'my-plugin-1': {
            url: 'http://localhost:5001',
            format: 'module',
            from: 'webpack'
          }
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: false
          },
          'react-dom': {
            singleton: true,
            requiredVersion: false
          }
        }
      })
    )
    return config
  }
}
```

### 3. Hot Module Replacement (HMR)

Next.js's built-in HMR for development:

```javascript
// next.config.js
module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300
      }
    }
    return config
  }
}
```

## Plugin Integration Methods

### 1. Local Development

Using git submodules:
```bash
# Add plugin as a submodule
git submodule add https://github.com/org/plugin-repo.git plugins/plugin-name
```

Next.js configuration:
```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@plugins': path.join(__dirname, 'plugins')
    }
    return config
  }
}
```

### 2. Package Manager Integration

```bash
# Add plugin as a dependency
npm install github:org/plugin-repo
# or
yarn add github:org/plugin-repo
```

Next.js configuration:
```javascript
// next.config.js
module.exports = {
  transpilePackages: ['plugin-name']
}
```

### 3. Remote Plugin Hosting

Load plugins from external sources:
```javascript
// PluginService.js
async loadPlugin(pluginId) {
  const plugin = this.plugins.get(pluginId);
  try {
    const module = await dynamic(() => import(/* @next-ignore */ plugin.repositoryUrl), {
      ssr: false
    });
    
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
│   │   └── next.config.js
│   └── my-plugin-2/
│       ├── src/
│       ├── package.json
│       └── next.config.js
└── next.config.js
```

2. **Main Application Configuration**
```javascript
// next.config.js in MapRoulette root
const { NextFederationPlugin } = require('@module-federation/nextjs-mf')

module.exports = {
  webpack: (config, options) => {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'maproulette',
        remotes: {
          'my-plugin-1': {
            url: 'http://localhost:5001',
            format: 'module',
            from: 'webpack'
          },
          'my-plugin-2': {
            url: 'http://localhost:5002',
            format: 'module',
            from: 'webpack'
          }
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: false
          },
          'react-dom': {
            singleton: true,
            requiredVersion: false
          }
        }
      })
    )
    return config
  }
}
```

3. **Plugin Configuration**
```javascript
// next.config.js in each plugin directory
const { NextFederationPlugin } = require('@module-federation/nextjs-mf')

module.exports = {
  webpack: (config, options) => {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'my-plugin-1',
        filename: 'remoteEntry.js',
        exposes: {
          './Plugin': './src/index.js'
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: false
          },
          'react-dom': {
            singleton: true,
            requiredVersion: false
          }
        }
      })
    )
    return config
  }
}
```

4. **Development Scripts**
```json
// package.json in MapRoulette root
{
  "scripts": {
    "dev": "next dev",
    "dev:plugins": "concurrently \"cd plugins/my-plugin-1 && npm run dev\" \"cd plugins/my-plugin-2 && npm run dev\"",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:plugins\""
  }
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

### Key Differences from Vite Version

1. **Module Federation**
   - Uses `@module-federation/nextjs-mf` instead of Vite's federation
   - Different configuration structure
   - Handles SSR considerations

2. **Dynamic Imports**
   - Uses Next.js's `dynamic` import
   - SSR considerations with `ssr: false`
   - Different error handling

3. **Build Process**
   - Uses webpack instead of Vite
   - Different optimization strategies
   - SSR-specific considerations

4. **Development Server**
   - Uses Next.js's development server
   - Different HMR implementation
   - Built-in API routes support

## Best Practices

1. **SSR Considerations**
   - Disable SSR for plugins unless specifically needed
   - Handle loading states appropriately
   - Consider hydration issues

2. **Performance**
   - Use Next.js's built-in optimizations
   - Implement proper code splitting
   - Leverage Next.js's image optimization

3. **Security**
   - Implement proper CSP headers
   - Validate plugin sources
   - Handle CORS appropriately

4. **Error Handling**
   - Use Next.js's error boundaries
   - Implement proper fallbacks
   - Handle SSR errors

## Production Deployment

1. **Build Process**
```bash
# Build main application
npm run build

# Build plugins
cd plugins/my-plugin-1
npm run build
```

2. **Deployment Configuration**
```javascript
// next.config.js
module.exports = {
  webpack: (config, options) => {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'maproulette',
        remotes: {
          'my-plugin-1': {
            url: 'https://your-cdn.com/plugins/my-plugin-1',
            format: 'module',
            from: 'webpack'
          }
        }
      })
    )
    return config
  }
}
```
