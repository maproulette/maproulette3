import _isFinite from 'lodash/isFinite'
import { basemapLayerSource }
       from '../../services/VisibleLayer/LayerSources'

/**
 * AsMappableChallenge adds functionality to a Challenge related to mapping.
 */
export class AsMappableChallenge {
  constructor(challenge) {
    Object.assign(this, challenge)
  }

  defaultLayerSource() {
    if (!_isFinite(this.id)) {
      return null
    }

    return basemapLayerSource(this.defaultBasemap,
                              this.defaultBasemapId,
                              this.customBasemap,
                              `challenge_${this.id}`)
  }
}

export default challenge => new AsMappableChallenge(challenge)
