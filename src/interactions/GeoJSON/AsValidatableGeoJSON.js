import geojsonhint from '@mapbox/geojsonhint'

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
   * Validate the raw GeoJSON.
   */
  validate() {
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
