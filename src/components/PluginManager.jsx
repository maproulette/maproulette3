import React, { useEffect, useState } from 'react';
import pluginService from '../services/PluginService';

const PluginManager = () => {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load initial plugins
    setPlugins(pluginService.getPlugins());
    setLoading(false);
  }, []);

  const handleTogglePlugin = async (pluginId) => {
    try {
      const plugin = pluginService.getPlugin(pluginId);
      
      if (plugin.enabled) {
        await pluginService.unloadPlugin(pluginId);
      } else {
        await pluginService.loadPlugin(pluginId);
      }
      
      // Refresh plugin list
      setPlugins(pluginService.getPlugins());
    } catch (err) {
      console.error(`Error toggling plugin ${pluginId}:`, err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading plugins...</div>;
  }

  return (
    <div className="plugin-manager">
      <h2>Plugin Manager</h2>
      
      {error && (
        <div className="plugin-manager-error">
          Error: {error}
        </div>
      )}
      
      <div className="plugin-list">
        {plugins.map(plugin => (
          <div key={plugin.id} className="plugin-item">
            <div className="plugin-info">
              <h3>{plugin.name}</h3>
              <p>{plugin.description}</p>
              <p>Version: {plugin.version}</p>
            </div>
            
            <div className="plugin-actions">
              <button
                onClick={() => handleTogglePlugin(plugin.id)}
                className={plugin.enabled ? 'plugin-disable' : 'plugin-enable'}
              >
                {plugin.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PluginManager; 