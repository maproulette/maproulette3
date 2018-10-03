/**
 * This script is intended to be run via yarn scripts in package.json file.
 *
 * Retrieves the latest layer data from the [OSM Editor Layer
 * Index](https://github.com/osmlab/editor-layer-index) project, extracts
 * default layers, and -- if necessary -- creates a stub for extra layers
 * that user can optionally fill in with any custom layers.
 *
 * Requires curl and jq to both be installed.
 */
require('dotenv').config()
const _get = require('lodash/get')
const shell = require('shelljs')
shell.config.silent = true

// Ensure curl and jq are both installed
if (!shell.which('curl')) {
  shell.echo("Please install curl first")
  shell.exit(1)
}

if (!shell.which('jq')) {
  shell.echo("Please install jq first")
  shell.exit(1)
}

// This script should be run from the project root. Let's just make sure
// a `src/` subdirectory exists.
if (shell.ls('./src').length === 0) {
  shell.echo("Please run from the project root")
  shell.exit(1)
}

// Additional layers (from the Layer Index) to include in addition to the
// default layers.
const additionalIndexLayers =
  _get(process.env, 'REACT_APP_ADDITIONAL_INDEX_LAYERS', '').split(/,\s*/)

// Download latest layer data and save to `src/imagery.json`
shell.echo("Fetching latest layer data")
if (shell.exec("curl -s https://osmlab.github.io/editor-layer-index/imagery.geojson -o ./src/imagery.json").code !== 0) {
  shell.echo("Fetching updated layers failed")
  shell.exit(1)
}

// Extract properties from layers marked as default layers that have global
// coverage (geometry is null) and save them to `src/defaultLayers.json`. We
// also include any "additional" layers requested
shell.echo("Extracting default layers")
const jqLayerConditionals = additionalIndexLayers.map(layerId => ` or .properties.id == "${layerId}"`).join(' ')
if (shell.exec("jq '[.features[] | select((.properties.default == true and .properties.geometry == null)" + jqLayerConditionals + ")]' ./src/imagery.json > ./src/defaultLayers.json").code !== 0) {
  shell.echo("Extracting default layers failed")
  shell.exit(1)
}

// Users can add custom layers to `src/customLayers.json`. If the file does not
// exist, create a stub with an empty array of layers
if (shell.ls('./src/customLayers.json').length === 0) {
  shell.echo("Creating stub for src/customLayers.json -- you can add any custom layers to it")
  shell.echo('[]').to('./src/customLayers.json')
}
