import _isFinite from 'lodash/isFinite'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _isString from 'lodash/isString'
import { ChallengeBasemap }
       from '../../services/Challenge/ChallengeBasemap/ChallengeBasemap'

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
   * Returns true if the challenge is determined to have zero tasks.
   */
  hasZeroTasks() {
    return _get(this, 'actions.total', 0) === 0
  }

  /**
   * Returns true if the source (overpass, local GeoJSON, remote URL) should be
   * treated as read-only. This will return true for existing challenges that
   * do not have zero tasks.
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

  /**
   * Returns the checkin/changeset comment less any #maproulette hashtags
   */
  checkinCommentWithoutMaprouletteHashtag() {
    // Strip out any separator whitespace before the hashtag too
    return this.checkinComment ?
           this.checkinComment.replace(new RegExp("\\s*" + maprouletteHashtag, "g"), '') :
           this.checkinComment
  }

  /**
   * The edit-challenge form can set defaultBasemap to one of the numeric
   * constants, but can also set it to the string identifier of a layer not
   * otherwise represented by a constant.
   *
   * This normalizes the defaultBasemap value to a valid constant from
   * ChallengeBasemap, and also sets the defaultBasemapId to a string
   * identifier if appropriate.
   *
   */
  normalizeDefaultBasemap() {
    if (_isFinite(Number(this.defaultBasemap))) {
      this.defaultBasemapId = ''
      this.defaultBasemap = Number(this.defaultBasemap)
    }
    else if (_isString(this.defaultBasemap) && this.defaultBasemap.length > 0) {
      this.defaultBasemapId = this.defaultBasemap
      this.defaultBasemap = ChallengeBasemap.identified
    }
    else {
      this.defaultBasemapId = ''
      this.defaultBasemap = ChallengeBasemap.none
    }
  }
}

export default challenge => new AsEditableChallenge(challenge)
