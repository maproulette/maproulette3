import _isEmpty from 'lodash/isEmpty'

/**
 * AsManageable adds functionality to a Challenge related to management.
 */
export class AsManageable {
  constructor(challenge) {
    Object.assign(this, challenge)
  }

  isRebuildable() {
    return !_isEmpty(this.overpassQL)
  }
}

export default challenge => new AsManageable(challenge)
