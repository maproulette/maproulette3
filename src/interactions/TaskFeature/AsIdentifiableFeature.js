import _find from 'lodash/find'
import _get from 'lodash/get'
import _isUndefined from 'lodash/isUndefined'

/**
 * The names of feature and property fields that may be used to identify a
 * feature representing an OSM element
 */
export const featureIdFields = ['@id', 'osmid', 'osmIdentifier', 'id']

/**
 * AsIdentifiableFeature adds functionality to a Task feature related to
 * identification, especially identification of the OSM element represented by
 * the feature
 */
export class AsIdentifiableFeature {
  constructor(feature) {
    Object.assign(this, feature)
  }

  /**
   * Returns the complete id found on the given feature or its properties, or
   * null if none is found
   */
  rawFeatureId() {
    if (!this.properties) {
      return null
    }

    // Look on the feature itself first, then on its properties
    let idProp = _find(featureIdFields, name => this[name] &&
                                                this.isValidId(this[name]))
    if (idProp) {
      return this[idProp]
    }

    idProp = _find(featureIdFields, name => this.properties[name] &&
                                            this.isValidId(this.properties[name]))
    return idProp ? this.properties[idProp] : null
  }

  /**
   * Extracts the numerical OSM id from the raw feature id, returning null if
   * the feature isn't identifiable or a numerical id could not be extracted
   */
  osmId() {
    const featureId = this.rawFeatureId()
    if (!featureId) {
      return null
    }

    // feature ids may contain additional information, such as a representation
    // of the feature type (way, node, etc). We want to return just the the
    // numerical OSM id
    const match = /(\d+)/.exec(featureId)
    return (match && match.length > 1) ? match[1] : null
  }

  /**
   * Extracts the OSM element from the raw feature id (falling back to a `type`
   * property if none is found in the id) and returns 'node', 'way', or
   * 'relation', or null if no type is detected
   */
  osmType() {
    const typeRe = /^(node|way|relation|n|r|w)/

    let featureType = this.rawFeatureId()
    if (!typeRe.test(featureType)) {
      featureType = this.properties.type ? this.properties.type :
        (this.properties["@type"] || this.properties["@osm_type"])
      if (!typeRe.test(featureType)) {
        // No luck finding an explicit type. Try to infer from the geometry
        const geometryType = _get(this, 'geometry.type')
        if (geometryType === "Point") {
          featureType = "node"
        }
        else if (geometryType === "LineString") {
          featureType = "way"
        }
      }
    }

    const match = typeRe.exec(featureType)
    if (match) {
      switch (match[0]) {
        case 'node':
        case 'n':
          return 'node'
        case 'way':
        case 'w':
          return 'way'
        case 'relation':
        case 'r':
          return 'relation'
        default:
          return null
      }
    }

    return null
  }

  /**
   * Returns the type and id in the form of `type id`, or just id if no type
   * can be found. Returns null if no id can be found
   */
  normalizedTypeAndId(requireType=false, separator=' ') {
    const osmId = this.osmId()
    if (!osmId) {
      // We must have at least an id
      return null
    }

    const osmType = this.osmType()
    if (requireType && !osmType) {
      return null
    }

    return (osmType ? `${osmType}${separator}` : '') + osmId
  }

  isValidId(id) {
    if (_isUndefined(id)) {
      return false
    }

    // Ids that are only numeric or start with node/way/relation (eg. 'node/12345')
    // or start with just a character n/r/w (eg. 'n12345')
    const re = new RegExp(/^(node|way|relation|n|r|w)?\/?\d+$/)
    return !!re.exec(id)
  }
}

export default feature => new AsIdentifiableFeature(feature)
