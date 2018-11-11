import geojsonhint from '@mapbox/geojsonhint'
import _isString from 'lodash/isString'
import _flatten from 'lodash/flatten'
import _map from 'lodash/map'
import _trim from 'lodash/trim'
import AsLineReadableFile from '../File/AsLineReadableFile'

/**
 * Provides methods related to validating and linting GeoJSON.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class AsValidatableGeoJSON {
  /**
   * geoJOSN can either be a string or a File, but it must be a File to
   * perform validation of line-by-line format
   */
  constructor(geoJSON) {
    if (_isString(geoJSON)) {
      this.geoJSONFile = null
      this.geoJSONString = geoJSON
    }
    else {
      this.geoJSONFile = AsLineReadableFile(geoJSON)
      this.geoJSONString = null
    }
  }

  /**
   * Detect if the raw GeoJson is line-by-line, where each line contains
   * a separate entity, using a quick, rough check
   */
  async isLineByLine() {
    if (!this.geoJSONFile) {
      return false
    }

    // Our detection approach here is pretty rudimentary, basically looking for
    // open-brace at start of line and close-brace at end of line (optionally
    // followed by a newline), and then checking the first two lines to see if
    // they match
    this.geoJSONFile.rewind()
    const lines = await this.geoJSONFile.readLines(2)
    this.geoJSONFile.rewind()

    const re = /^\{[^\n]+\}(\r?\n|$)/
    return lines.length > 1 && re.test(lines[0]) && re.test(lines[1])
  }

  /**
   * Performs validation on each line separately, ensuring each line represents
   * an individual GeoJSON entity.
   */
  async validateLineByLine() {
    const allErrors = []
    let lineNumber = 1

    this.geoJSONFile.rewind()
    this.geoJSONFile.forEach(1, rawLine => {
      const line = _trim(rawLine)
      if (line.length > 0) { // Skip blank lines or pure whitespace
        try {
          const geoJSONObject = JSON.parse(line)
          const errors = geojsonhint.hint(geoJSONObject)
          if (errors.length > 0) {
            // remap line numbers
            allErrors.push(_map(errors, error => ({
              line: lineNumber,
              message: error.message,
            })))
          }
        }
        catch(parseError) {
          allErrors.push({
            line: lineNumber,
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
  async validate() {
    if (await this.isLineByLine()) {
      return this.validateLineByLine()
    }

    let geoJSONObject = null

    // json-lint-lines, used by geojsonhint when parsing string data, seems
    // to struggle with certain geojson files. So we parse the json ourselves
    // and give an object to geojsonhint, which side-steps the issue. The
    // downside is that we lose line numbers when reporting errors.
    try {
      let geoJSON = this.geoJSONString
      if (geoJSON === null && this.geoJSONFile) {
        let geoJSONLines = await this.geoJSONFile.allLines()
        geoJSON = geoJSONLines.join('\n')
      }
      geoJSONObject = JSON.parse(geoJSON)
    }
    catch(parseError) {
      return [{message: `${parseError}`}]
    }

    return geojsonhint.hint(geoJSONObject)
  }
}

export default geoJSON => new AsValidatableGeoJSON(geoJSON)
