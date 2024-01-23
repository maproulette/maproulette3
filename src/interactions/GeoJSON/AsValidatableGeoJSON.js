 import { isFeatureCollection } from 'geojson-validation';
import _isString from 'lodash/isString'
import _flatten from 'lodash/flatten'
import _trim from 'lodash/trim'
import { featureEach } from '@turf/meta'
import { getGeom } from '@turf/invariant'
import AsLineReadableFile from '../File/AsLineReadableFile'
import messages from './Messages'

const RS = String.fromCharCode(0x1E) // RS (record separator) control char

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
    // either RFC 7464 compliance or an open-brace at start of line and
    // close-brace at end of line (optionally followed by a newline) on the
    // first two lines
    this.geoJSONFile.rewind()
    const lines = await this.geoJSONFile.readLines(2)
    this.geoJSONFile.rewind()

    const re = /^\{[^\n]+\}(\r?\n|$)/
    return this.isRFC7464Sequence(lines[0]) ||
           (re.test(lines[0]) && re.test(lines[1]))
  }

  /**
   * Performs basic check to see if this is RFC 7464 compliant, which is to say
   * each line begins with a RS (record separator) control character
   */
  isRFC7464Sequence(line) {
    return line && line.length > 1 && line[0] === RS
  }

  /**
   * Normalize a RFC 7464 sequence by stripping any RS characters from the beginning
   * of the line. This is safe to run on strings containing ordinary JSON as well
   */
  normalizeRFC7464Sequence(line) {
    return line.replace(new RegExp(`^${RS}+`, 'g'), '')
  }

  /**
   * Performs validation on each line separately, ensuring each line represents
   * an individual GeoJSON entity.
   */  
  async validateLineByLine() {
    const allErrors = []
    let lineNumber = 1

    this.geoJSONFile.rewind()
    await this.geoJSONFile.forEach(1, rawLine => {
      const line = this.normalizeRFC7464Sequence(_trim(rawLine))
      if (line.length > 0) { // Skip blank lines or pure whitespace
        try {
          const geoJSONObject = JSON.parse(line)
          if (geoJSONObject) {
            try {
              this.flagUnsupportedGeometries(geoJSONObject)
            } catch (errorMessage) {
              allErrors.push({
                line: lineNumber,
                message: errorMessage,
              })
            }

            const validationResult = isFeatureCollection(geoJSONObject)
            if(validationResult.errors) {
              allErrors.push({
                line: lineNumber,
                message: 'Invalid GeoJSON geometry',
              })
            }
          }
        } catch (parseError) {
          allErrors.push({
            line: lineNumber,
            message: `${parseError}`,
          })
        }

        lineNumber++
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
    } catch (parseError) {
      return [{ message: `${parseError}` }]
    }

    if (geoJSONObject) {
      try {
        this.flagUnsupportedGeometries(geoJSONObject);
      } catch (errorMessage) {
        return [{ message: errorMessage }];
      }
    }

    const validationResult = isFeatureCollection(geoJSONObject);
    
    if( validationResult.errors ){
    return validationResult.valid ? [] : validationResult.errors(error => ({
      message: error,
    }));

  }
    return []
  }

  /**
   * Throw error if unsupported (even if technically legal) geometries are
   * discovered, as otherwise these will simply result in errors or other
   * problematic behavior on the backend
   */
  flagUnsupportedGeometries(geoJSONObject) {
    featureEach(geoJSONObject, feature => {
      const geom = getGeom(feature)
      if (!geom) {
        throw messages.noNullGeometry
      }

      if (geom.type === "Point" && geom.coordinates.length > 2) {
        throw messages.noZCoordinates
      }
    })
  }
}

export default geoJSON => new AsValidatableGeoJSON(geoJSON)
