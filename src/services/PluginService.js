import React from 'react';

// Plugin Service for managing and loading plugins
class PluginService {
  constructor() {
    this.plugins = new Map();
    this.loadedPlugins = new Map();
    this.loadEnabledPlugins();
  }

  // Load enabled plugins from localStorage
  loadEnabledPlugins() {
    try {
      const enabledPlugins = JSON.parse(localStorage.getItem('enabledPlugins') || '[]');
      enabledPlugins.forEach(pluginId => {
        const plugin = this.plugins.get(pluginId);
        if (plugin) {
          this.loadPlugin(pluginId).catch(error => {
            console.error(`Failed to load previously enabled plugin ${pluginId}:`, error);
          });
        }
      });
    } catch (error) {
      console.error('Failed to load enabled plugins from localStorage:', error);
    }
  }

  // Save enabled plugins to localStorage
  saveEnabledPlugins() {
    try {
      const enabledPlugins = Array.from(this.loadedPlugins.keys());
      localStorage.setItem('enabledPlugins', JSON.stringify(enabledPlugins));
    } catch (error) {
      console.error('Failed to save enabled plugins to localStorage:', error);
    }
  }

  // Register a new plugin
  registerPlugin(plugin) {
    if (!plugin.id || !plugin.name || !plugin.entryPoint) {
      throw new Error('Plugin registration requires id, name, and entryPoint');
    }
    
    // Add default injection points if not specified
    if (!plugin.injectionPoints) {
      plugin.injectionPoints = [];
    }
    
    this.plugins.set(plugin.id, plugin);
  }

  async loadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (this.loadedPlugins.has(pluginId)) {
      return this.loadedPlugins.get(pluginId);
    }

    try {
      // Load the plugin module using the registered entryPoint
      const module = await import(/* @vite-ignore */ plugin.entryPoint);
      
      if (!module.initialize || typeof module.initialize !== 'function') {
        throw new Error(`Plugin ${pluginId} does not export an initialize function`);
      }

      // Initialize the plugin
      const pluginInstance = await module.initialize({
        React,
        // Add any other context needed by plugins
      });

      this.loadedPlugins.set(pluginId, {
        ...plugin,
        instance: pluginInstance
      });

      // Save enabled plugins after loading
      this.saveEnabledPlugins();

      return this.loadedPlugins.get(pluginId);
    } catch (error) {
      console.error(`Failed to load plugin ${pluginId}:`, error);
      throw error;
    }
  }

  getPlugin(pluginId) {
    const plugin = this.loadedPlugins.get(pluginId);
    if (!plugin) {
      // If not in loadedPlugins, check if it exists in plugins
      const registeredPlugin = this.plugins.get(pluginId);
      if (registeredPlugin) {
        return {
          ...registeredPlugin,
          enabled: false
        };
      }
      return null;
    }
    return {
      ...plugin,
      enabled: true
    };
  }

  isPluginLoaded(pluginId) {
    return this.loadedPlugins.has(pluginId);
  }

  getPluginComponent(pluginId, componentName) {
    const plugin = this.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not loaded`);
    }

    const component = plugin.instance.components[componentName];
    if (!component) {
      throw new Error(`Component ${componentName} not found in plugin ${pluginId}`);
    }

    return component;
  }

  async unloadPlugin(pluginId) {
    const plugin = this.loadedPlugins.get(pluginId);
    if (plugin && plugin.instance.cleanup) {
      await plugin.instance.cleanup();
    }
    this.loadedPlugins.delete(pluginId);
    // Save enabled plugins after unloading
    this.saveEnabledPlugins();
  }

  // Get all plugins that should be injected at a specific point
  getPluginsForInjectionPoint(injectionPoint) {
    const plugins = [];
    this.loadedPlugins.forEach((plugin) => {
      if (plugin.injectionPoints && plugin.injectionPoints.includes(injectionPoint)) {
        plugins.push(plugin);
      }
    });
    return plugins;
  }

  // Get all registered plugins
  getPlugins() {
    return Array.from(this.plugins.values()).map(plugin => ({
      ...plugin,
      enabled: this.loadedPlugins.has(plugin.id)
    }));
  }
}

export default new PluginService();