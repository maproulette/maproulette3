import _isFinite from 'lodash/isFinite'
import _isObject from 'lodash/isObject'
import { basemapLayerSource }
       from '../../services/VisibleLayer/LayerSources'

/**
 * AsMappingUser adds functionality to a user related to mapping.
 */
export class AsMappingUser {
  constructor(user) {
    Object.assign(this, user)
  }

  defaultLayerSource() {
    if (!_isFinite(this.id) || !_isObject(this.settings)) {
      return null
    }

    return basemapLayerSource(this.settings.defaultBasemap,
                              this.settings.defaultBasemapId,
                              this.settings.customBasemap,
                              `user_${this.id}`)
  }
}

export default user => new AsMappingUser(user)
