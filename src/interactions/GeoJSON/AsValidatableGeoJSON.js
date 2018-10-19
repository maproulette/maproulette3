import geojsonhint from '@mapbox/geojsonhint'
import _each from 'lodash/each'
import _flatten from 'lodash/flatten'
import _map from 'lodash/map'
import _trim from 'lodash/trim'

/**
 * Provides methods related to validating and linting GeoJSON.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class AsValidatableGeoJSON {
  constructor(geoJSONString) {
    this.rawGeoJSON = geoJSONString
  }

  /**
   * Splits the raw GeoJSON into individual lines.
   */
  asLines() {
    return this.rawGeoJSON.split(/\r?\n/)
  }

  /**
   * Detect if the raw GeoJson is line-by-line, where each line contains
   * a separate entity, using a quick, rough check
   */
  isLineByLine() {
    // Our detection approach here is pretty rudimentary, basically looking for
    // open-brace at start of line and close-brace at end of line (optionally
    // followed by a newline), and then checking the first two lines to see if
    // they match

    const lines = this.asLines()
    const re = /^\{[^\n]+\}(\r?\n|$)/

    return lines.length > 1 && re.test(lines[0]) && re.test(lines[1])
  }

  /**
   * Performs validation on each line separately, ensuring each line represents
   * an individual GeoJSON entity.
   */
  validateLineByLine() {
    const lines = this.asLines()
    const allErrors = []

    _each(lines, (rawLine, index) => {
      const line = _trim(rawLine)
      if (line.length > 0) { // Skip blank lines or pure whitespace
        try {
          const geoJSONObject = JSON.parse(line)
          const errors = geojsonhint.hint(geoJSONObject)
          if (errors.length > 0) {
            // remap line numbers
            allErrors.push(_map(errors, error => ({
              line: index + 1,
              message: error.message,
            })))
          }
        }
        catch(parseError) {
          allErrors.push({
            line: index + 1,
            message: `${parseError}`,
          })
        }
      }
    })

    return allErrors.length === 0 ? [] : _flatten(allErrors)
  }

  /**
   * Validate the raw GeoJSON. Will attempt to auto-detect line-by-line
   */
  validate() {
    if (this.isLineByLine()) {
      return this.validateLineByLine()
    }

    let geoJSONObject = null

    // json-lint-lines, used by geojsonhint when parsing string data, seems
    // to struggle with certain geojson files. So we parse the json ourselves
    // and give an object to geojsonhint, which side-steps the issue. The
    // downside is that we lose line numbers when reporting errors.
    try {
      geoJSONObject = JSON.parse(this.rawGeoJSON)
    }
    catch(parseError) {
      return [{message: `${parseError}`}]
    }

    return geojsonhint.hint(geoJSONObject)
  }
}

export default rawGeoJSON => new AsValidatableGeoJSON(rawGeoJSON)
