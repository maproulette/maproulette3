import _map from 'lodash/map'
import _groupBy from 'lodash/groupBy'
import _each from 'lodash/each'
import _pick from 'lodash/pick'
import _reduce from 'lodash/reduce'
import { statusMachineName } from '../Task/TaskStatus/TaskStatus'

/**
 * Converts detailed activity (such as from the `status/activity` endpoint) to the
 * traditional summary format provided by other activity endpoints. Normalized
 * activity is returned by challenge id.
 */
export const normalizeDetailedActivity = function(detailedActivity) {
  // Begin by adding the additional fields expected for summary entries
  const normalizedActivity = _map(detailedActivity, entry => {
    entry.status = entry.newStatus
    entry.statusName = statusMachineName(entry.newStatus)
    entry.date = midnightOnDate(entry.created)
    entry.count = 1

    return entry
  })

  // Now we need to group activity by challenge, and then -- for each challenge --
  // accumulate all similar status changes on a single date into a single entry
  // for that status with a count.
  //
  // Start by running through the entries for each challenge
  const activityByChallenge = _groupBy(normalizedActivity, 'challengeId')
  _each(activityByChallenge, (activityWithChallenge, challengeId) => {
    const challengeActivityResults = []

    // Run through the entries for each day for this challenge
    const challengeActivityByDate = _groupBy(activityWithChallenge, 'date')
    _each(challengeActivityByDate, (activityWithDate, date) => {
      // Run through the entries for each status for this day
      const datedChallengeActivityByStatus = _groupBy(activityWithDate, 'status')
      _each(datedChallengeActivityByStatus, (activityWithStatus, status) => {
        // Consolidate all the entries for this day and status into a single
        // entry with a count.
        const consolidatedStatusEntry =
          _reduce(activityWithStatus, (consolidated, entry) => {
            consolidated.count += entry.count
            return consolidated
          })

        // Add this consolidated entry to our challenge activity results, picking
        // just the expected fields.
        challengeActivityResults.push(
          _pick(consolidatedStatusEntry, ['date', 'status', 'statusName', 'count'])
        )
      })
    })

    activityByChallenge[challengeId] = challengeActivityResults
  })

  return activityByChallenge
}

/**
 * @private
 */
export const midnightOnDate = function(isoDateString) {
  return isoDateString.replace(/T.+$/, 'T00:00:00')
}
