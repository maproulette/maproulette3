import _isFinite from 'lodash/isFinite'
import _get from 'lodash/get'

/**
 * AsEditableChallenge adds functionality to a Challenge related to editing.
 */
export class AsEditableChallenge {
  constructor(challenge) {
    Object.assign(this, challenge)
  }

  isSourceReadOnly() {
    return _isFinite(this.id) && _get(this, 'actions.total') !== 0
  }

  clearSources() {
    delete this.localGeoJSON
    delete this.overpassQL
    delete this.remoteGeoJson
  }
}

export default challenge => new AsEditableChallenge(challenge)
