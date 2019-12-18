import _find from 'lodash/find'
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
