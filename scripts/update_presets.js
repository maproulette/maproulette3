/**
 * This script is intended to be run via yarn scripts in package.json file
 *
 * Copies the latest iD preset data from the [iD Tagging Schema]
 * (https://github.com/openstreetmap/id-tagging-schema) npm module, which must
 * be installed prior to running this script
 */
const shell = require('shelljs')
shell.config.silent = true

// This script should be run from the project root. Let's just make sure
// a `src/` subdirectory exists.
if (shell.ls('./src').length === 0) {
  shell.echo("Please run from the project root")
  shell.exit(1)
}

// Let's also ensure the NPM module is installed
if (shell.ls('./node_modules/@openstreetmap/id-tagging-schema/').length === 0) {
  shell.echo("The @openstreetmap/id-tagging-schema NPM module was not found. Please ensure it is installed.")
  shell.exit(1)
}

shell.echo("Copying latest iD preset data into source tree")
if (shell.exec(
      "cp node_modules/@openstreetmap/id-tagging-schema/dist/preset_categories.json src/preset_categories.json"
    ).code !== 0) {
  shell.echo("Copy failed.")
  shell.exit(1)
}
