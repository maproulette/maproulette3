import _isEmpty from 'lodash/isEmpty'
import _isObject from 'lodash/isObject'
import _isFinite from 'lodash/isFinite'
import _get from 'lodash/get'
import _filter from 'lodash/filter'
import _maxBy from 'lodash/maxBy'
import parse from 'date-fns/parse'
import { ChallengeStatus }
       from '../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { isCompletionStatus }
       from '../../services/Task/TaskStatus/TaskStatus'

export const SOURCE_OVERPASS = 'overpass'
export const SOURCE_REMOTE = 'remote'
export const SOURCE_LOCAL = 'local'

/**
 * AsManageableChallenge adds functionality to a Challenge related to
 * management.
 */
export class AsManageableChallenge {
  constructor(challenge) {
    Object.assign(this, challenge)
  }

  isRebuildable() {
    return _isFinite(this.status) &&
           this.status !== ChallengeStatus.none &&
           this.status !== ChallengeStatus.building &&
           this.status !== ChallengeStatus.deletingTasks
  }

  dataSource() {
    if (!_isEmpty(this.overpassQL)) {
      return SOURCE_OVERPASS
    }
    else if (!_isEmpty(this.remoteGeoJson)) {
      return SOURCE_REMOTE
    }
    else {
      return SOURCE_LOCAL
    }
  }

  isComplete() {
    return this.status === ChallengeStatus.finished ||
           (_get(this, 'actions.total', 0) > 0 &&
            _get(this, 'actions.available') === 0)
  }

  completionPercentage() {
    if (_get(this, 'actions.total', 0) > 0) {
      return percentage(this.actions.total,
                        this.actions.total - this.actions.available)
    }
    else {
      return 0
    }
  }

  actionPercentage(action) {
    return percentage(_get(this, 'actions.total'),
                      _get(this, `actions.${action}`, 0))
  }

  completionActivity() {
    return _filter(
      this.activity,
      entry => entry.count > 0 && isCompletionStatus(entry.status)
    )
  }

  mostRecentCompletionActivityEntry() {
    if (_isEmpty(this.activity)) {
      return null
    }

    return _maxBy(this.completionActivity(),
                  entry => parse(entry.date).getTime())
  }

  mostRecentCompletionActivityDate() {
    const entry = this.mostRecentCompletionActivityEntry()
    return _isObject(entry) ? parse(entry.date) : null
  }
}

/**
 * @private
 */
export const percentage = function(total, value, decimalPlaces=1) {
  let percentage = 0
  if (_isFinite(total) && total > 0) {
    percentage = value / total * 100.0
  }

  return Math.round(percentage)
}

export default challenge => new AsManageableChallenge(challenge)
