import React, { useEffect, useState } from 'react';
import pluginService from '../services/PluginService';

const PluginContainer = ({ pluginId, componentName, ...props }) => {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlugin = async () => {
      try {
        // Load the plugin if it's not already loaded
        if (!pluginService.isPluginLoaded(pluginId)) {
          await pluginService.loadPlugin(pluginId);
        }

        // Get the plugin instance
        const plugin = pluginService.getPlugin(pluginId);
        if (!plugin || !plugin.instance) {
          throw new Error(`Plugin ${pluginId} not properly loaded`);
        }
        
        // Get the requested component from the plugin instance
        const pluginComponent = plugin.instance.components[componentName];
        
        if (!pluginComponent) {
          throw new Error(`Component ${componentName} not found in plugin ${pluginId}`);
        }

        setComponent(() => pluginComponent);
      } catch (err) {
        console.error(`Error loading plugin ${pluginId}:`, err);
        setError(err.message);
      }
    };

    loadPlugin();

    // Cleanup when component unmounts
    return () => {
      // Note: We're not unloading the plugin here as it might be used by other containers
      // Plugin unloading should be handled by the plugin management UI
    };
  }, [pluginId, componentName]);

  if (error) {
    return <div className="plugin-error">Error loading plugin: {error}</div>;
  }

  if (!Component) {
    return <div className="plugin-loading">Loading plugin...</div>;
  }

  return <Component {...props} />;
};

export default PluginContainer; 