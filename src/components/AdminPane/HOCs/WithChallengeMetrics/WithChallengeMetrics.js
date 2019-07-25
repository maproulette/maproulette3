import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _toPairs from 'lodash/toPairs'
import _groupBy from 'lodash/groupBy'
import _sumBy from 'lodash/sumBy'
import _flatten from 'lodash/flatten'
import _compact from 'lodash/compact'
import _isEmpty from 'lodash/isEmpty'
import _isArray from 'lodash/isArray'
import _isFinite from 'lodash/isFinite'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import parse from 'date-fns/parse'
import WithComputedMetrics from '../../HOCs/WithComputedMetrics/WithComputedMetrics'
import WithDashboardEntityFilter
       from '../../HOCs/WithDashboardEntityFilter/WithDashboardEntityFilter'

import { TaskStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'

const WithChallengeMetrics = function(WrappedComponent) {
  return class extends Component {
    render() {
      let tasksAvailable = null
      let dailyMetrics = []

      if (!_isEmpty(this.props.taskMetrics) && !_isEmpty(this.props.challenges) &&
          _get(this.props.taskMetrics, 'total', 0) > 0) {
        tasksAvailable = _sumBy(this.props.challenges, 'actions.available')
        if (_isFinite(tasksAvailable)) {
          let allActivity = _isArray(this.props.activity) ? this.props.activity :
                            _compact(_flatten(_map(this.props.challenges, 'activity')))

          // Work our way backwards in time, sorting by date descending.
          let sortedActivity = _reverse(_sortBy(allActivity, 'date'))

          // Group activity entries by day
          const groupedByDate = _toPairs(_groupBy(sortedActivity, 'date'))

          // Calculate metrics for each day
          let totalRemaining = tasksAvailable
          dailyMetrics = _map(groupedByDate, dailyEntries => {
            const day = parse(dailyEntries[0])
            const dayActivity = dailyEntries[1]

            const completedToday = _sumBy(dayActivity, entry =>
              entry.status !== TaskStatus.created ? entry.count : 0
            )

            const metrics = {
              day,
              x: this.props.intl.formatDate(
                            day,
                            {day: '2-digit', month: '2-digit', year: '2-digit'}
                          ),
              y: totalRemaining,
              value: completedToday,
            }

            // We add to totalRemaining because we're going backwards through time,
            // so the prior day had more remaining tasks than the current day.
            totalRemaining += completedToday
            return metrics
          })
        }
      }

      return <WrappedComponent {...this.props}
                               tasksAvailable={tasksAvailable}
                               dailyMetrics={dailyMetrics} />
    }
  }
}

export const includeChallengeInMetrics = function(challenge, manager, tallied, challengeFilters, props) {
  const tallyMarks = tallied(_get(props.project, 'id'))
  if (tallyMarks && tallyMarks.length > 0 && tallyMarks.indexOf(challenge.id) === -1) {
    return false
  }

  return true
}

export default WrappedComponent =>
  WithDashboardEntityFilter(
    WithComputedMetrics(injectIntl(WithChallengeMetrics(WrappedComponent))),
    'challenge',
    'challenges',
    'talliedChallenges',
    'challenges',
    includeChallengeInMetrics
  )
