import _isFinite from 'lodash/isFinite'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'

const maprouletteHashtag = '#maproulette'

/**
 * AsEditableChallenge adds functionality to a Challenge related to editing.
 */
export class AsEditableChallenge {
  constructor(challenge) {
    Object.assign(this, challenge)
  }

  /**
   * Returns true if the challenge is new (lacks and id)
   */
  isNew() {
    return !_isFinite(this.id)
  }

  /**
   * Returns true if the challenge is determined to have zero tasks. Note that
   * this will return false if the number of tasks cannot be determined, so
   * false does not necessarily mean the challenge has tasks.
   */
  hasZeroTasks() {
    return _get(this, 'actions.total') === 0
  }

  /**
   * Returns true if the source (overpass, local GeoJSON, remote URL) should be
   * treated as read-only. This will return true for existing challenges that
   * do not have zero tasks. Note that if the number of tasks cannot be
   * determined, this will return true.
   */
  isSourceReadOnly() {
    return !this.isNew() && !this.hasZeroTasks()
  }

  /**
   * Clear all sources (overpass, local GeoJSON, remote URL) from challenge
   * data.
   */
  clearSources() {
    delete this.localGeoJSON
    delete this.overpassQL
    delete this.remoteGeoJson
  }

  /**
   * Appends the #maproulette hashtag to the existing checkin/changeset comment
   * if it's not already present somewhere in the comment.
   */
  appendHashtagToCheckinComment() {
    if (!new RegExp(maprouletteHashtag).test(this.checkinComment)) {
      this.checkinComment = _isEmpty(this.checkinComment) ?
                                     maprouletteHashtag :
                                     `${this.checkinComment} ${maprouletteHashtag}`
    }
  }
}

export default challenge => new AsEditableChallenge(challenge)
