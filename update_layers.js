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

// Download latest layer data and save to `src/imagery.json`
shell.echo("Fetching latest layer data")
if (shell.exec("curl -s https://osmlab.github.io/editor-layer-index/imagery.geojson -o ./src/imagery.json").code !== 0) {
  shell.echo("Fetching updated layers failed")
  shell.exit(1)
}

// Extract properties from layers marked as default layers, that are not
// overlays, and that have global coverage (geometry is null) and save them to
// `src/defaultLayers.json`
//
// > Note, for backward compatibility we also include OpenCycleMap
shell.echo("Extracting default layers")
if (shell.exec("jq '[.features[].properties | select((.default == true and .overlay != true and .geometry == null) or .id == \"tf-cycle\")]' ./src/imagery.json > ./src/defaultLayers.json").code !== 0) {
  shell.echo("Extracting default layers failed")
  shell.exit(1)
}

// Users can add custom layers to `src/extraLayers.json`. If the file does not
// exist, create a stub with an empty array of layers
if (shell.ls('./src/extraLayers.json').length === 0) {
  shell.echo("Creating stub for src/extraLayers.json -- you can add any custom layers to it")
  shell.echo('[]').to('./src/extraLayers.json')
}
