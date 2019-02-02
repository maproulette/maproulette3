import _get from 'lodash/get'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import countryCodeBoundingBoxJSON from '../../countryCodeBoundingBox.json'

/**
 * Map of bounding boxes indexed by country code.
 */
export const CountryBoundingBoxes =
  _reduce(countryCodeBoundingBoxJSON, function(result, value, key) {
      result[key] = {name: value[0], boundingBox: value[1]}
      return result
    }, {})


export const boundingBoxForCountry = function(countryCode) {
  return _get(CountryBoundingBoxes[countryCode], 'boundingBox')
}

export const supportedCountries = function() {
  return _map(CountryBoundingBoxes, (value, key) => {
    return {countryCode: key, name: value}
  })
}
