import React, { useState, useEffect } from 'react';
import pluginService from '../services/PluginService';
import PluginContainer from './PluginContainer';

const PluginInjectionPoint = ({ point, ...props }) => {
  const [plugins, setPlugins] = useState([]);

  useEffect(() => {
    // Initial load of plugins
    setPlugins(pluginService.getPluginsForInjectionPoint(point));

    // Set up an interval to check for plugin changes
    const intervalId = setInterval(() => {
      const currentPlugins = pluginService.getPluginsForInjectionPoint(point);
      setPlugins(currentPlugins);
    }, 1000); // Check every second

    return () => clearInterval(intervalId);
  }, [point]);

  console.log(plugins, point);

  if (!plugins.length) {
    return null;
  }

  return (
    <div className={`plugin-injection-point plugin-injection-point-${point}`}>
      {plugins.map(plugin => (
        <PluginContainer
          key={plugin.id}
          pluginId={plugin.id}
          componentName={plugin.defaultComponent || 'Main'}
          {...props}
        />
      ))}
    </div>
  );
};

export default PluginInjectionPoint; 