import _map from 'lodash/map'

/**
 * Migrates from one widget grid data-model version to the next. Each key
 * should be the version that requires a migration (e.g., use key `1` to
 * migrate from v1 to v2 and `2` to migrate from v2 to v3). Each value should
 * be a function that receives the old grid configuration and returns the updated
 * grid configuration. Returning null will cause a fresh default configuration
 * to be automatically generated, which can be used as a last resort if
 * migration isn't feasible.
 */
const GridMigrations = {
  1: configuration => {
    // Rename blocks to widgets
    configuration.widgets = _map(configuration.blocks, widgetConf => {
      widgetConf.widgetKey = widgetConf.blockKey.replace(/Block/g, 'Widget')
      widgetConf.label.id = widgetConf.label.id.replace(/GridBlocks/g, 'Widgets').replace(/Block/g, 'Widget')
      delete widgetConf.blockKey

      return widgetConf
    })
    delete configuration.blocks
    return configuration
  },
}

export default GridMigrations
