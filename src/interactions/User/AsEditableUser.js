import _isFinite from 'lodash/isFinite'
import _isString from 'lodash/isString'
import _find from 'lodash/find'
import { ChallengeBasemap }
       from '../../services/Challenge/ChallengeBasemap/ChallengeBasemap'

/**
 * AsEditableUser adds functionality to a User related to editing.
 */
export class AsEditableUser {
  constructor(user) {
    Object.assign(this, user)
  }

  /**
   * The user-settings form can set defaultBasemap to one of the numeric
   * constants, but can also set it to the string identifier of a layer not
   * otherwise represented by a constant.
   *
   * This normalizes the defaultBasemap value to a valid constant from
   * ChallengeBasemap, and also sets the defaultBasemapId to a string
   * identifier if appropriate.
   *
   */
  normalizeDefaultBasemap(layerSources, customBasemaps) {
    if (_isFinite(Number(this.defaultBasemap))) {
      this.defaultBasemapId = ''
      this.defaultBasemap = Number(this.defaultBasemap)
    }
    else if (_isString(this.defaultBasemap) && this.defaultBasemap.length > 0) {
      // Check to make sure our defaultBasemap is in our valid list of basemaps
      // If not found then set the default basemap to none.
      if (!_find(customBasemaps, (basemap) => basemap.name === this.defaultBasemap) &&
          !_find(layerSources, (basemap) => basemap.id === this.defaultBasemap)) {
        this.defaultBasemapId = ''
        this.defaultBasemap = ChallengeBasemap.none
      }
      else {
        this.defaultBasemapId = this.defaultBasemap
        this.defaultBasemap = ChallengeBasemap.identified
      }
    }
    else {
      this.defaultBasemapId = ''
      this.defaultBasemap = ChallengeBasemap.none
    }
  }
}

export default user => new AsEditableUser(user)
