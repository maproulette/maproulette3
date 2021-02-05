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
import _keys from 'lodash/keys'
import _pickBy from 'lodash/pickBy'
import _values from 'lodash/values'
import _indexOf from 'lodash/indexOf'
import _isEqual from 'lodash/isEqual'
import parse from 'date-fns/parse'
import WithComputedMetrics from '../../HOCs/WithComputedMetrics/WithComputedMetrics'
import WithDashboardEntityFilter
       from '../../HOCs/WithDashboardEntityFilter/WithDashboardEntityFilter'

import { TaskStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'

const WithChallengeMetrics = function(WrappedComponent, applyFilters = false) {
  return class extends Component {
    state = {
      loading: false
    }

    isFiltering(includesFiltersArray) {
      return _indexOf(_values(includesFiltersArray), false) !== -1
    }

    updateMetrics(props) {
      const challengeId =_get(props.challenge, 'id')

      if (challengeId && props.fetchChallengeActions) {
        this.setState({loading: true})
        const criteria = {filters: _get(props.searchFilters, 'filters')}
        criteria.invertFields = _get(props.searchCriteria, 'filters.invertFields')

        if (props.includeTaskStatuses && this.isFiltering(props.includeTaskStatuses)) {
          criteria.status = _keys(_pickBy(props.includeTaskStatuses, v => v)).join(',')
        }
        if (props.includeTaskReviewStatuses && this.isFiltering(props.includeTaskReviewStatuses)) {
          criteria.reviewStatus = _keys(_pickBy(props.includeTaskReviewStatuses, v => v)).join(',')
        }
        if (props.includeMetaReviewStatuses && this.isFiltering(props.includeMetaReviewStatuses)) {
          criteria.metaReviewStatus = _keys(_pickBy(props.includeMetaReviewStatuses, v => v)).join(',')
        }
        if (props.includeTaskPriorities && this.isFiltering(props.includeTaskPriorities)) {
          criteria.priorities =_keys(_pickBy(props.includeTaskPriorities, v => v)).join(',')
        }

        props.fetchChallengeActions(challengeId, true, criteria).then((normalizedResults) => {
          let fetchedMetrics = null
          let fetchedPriorityMetrics = null
          if (_get(normalizedResults, `entities.challenges.${challengeId}`)) {
            fetchedMetrics = _get(normalizedResults, 'entities.challenges')[challengeId].actions
            fetchedPriorityMetrics = _get(normalizedResults, 'entities.challenges')[challengeId].priorityActions
          }

          this.setState({loading: false,
                         fetchedMetrics: fetchedMetrics,
                         fetchedPriorityMetrics: fetchedPriorityMetrics})
        })
      }
    }

    componentDidMount() {
      this.updateMetrics(this.props)
    }

    componentDidUpdate(prevProps) {
      if (!applyFilters) {
        return false
      }

      const challengeId =_get(this.props.challenge, 'id')

      if (challengeId) {
        if (challengeId !== _get(this.props.challenge, 'id')) {
          return this.updateMetrics(this.props)
        }

        if (this.props.includeTaskStatuses !== prevProps.includeTaskStatuses) {
          return this.updateMetrics(this.props)
        }

        if (this.props.includeTaskReviewStatuses !== prevProps.includeTaskReviewStatuses) {
          return this.updateMetrics(this.props)
        }

        if (this.props.includeTaskPriorities !== prevProps.includeTaskPriorities) {
          return this.updateMetrics(this.props)
        }

        if (!_isEqual(_get(this.props.searchFilters, 'filters'),
                      _get(prevProps.searchFilters, 'filters'))) {
          return this.updateMetrics(this.props)
        }

        if (!_isEqual(_get(this.props.searchCriteria, 'filters.invertFields'),
                      _get(prevProps.searchCriteria, 'filters.invertFields'))) {
          return this.updateMetrics(this.props)
        }
      }
    }

    render() {
      let tasksAvailable = null
      let dailyMetrics = []

      const taskMetrics = this.state.fetchedMetrics || this.props.taskMetrics
      const taskMetricsByPriority = this.state.fetchedPriorityMetrics || this.props.taskMetricsByPriority

      if (!_isEmpty(taskMetrics) && !_isEmpty(this.props.challenges) &&
          _get(taskMetrics, 'total', 0) > 0) {
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
                               taskMetrics={taskMetrics}
                               tasksAvailable={tasksAvailable}
                               dailyMetrics={dailyMetrics}
                               taskMetricsByPriority={taskMetricsByPriority} />
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

export default (WrappedComponent, applyFilters = false) =>
  WithDashboardEntityFilter(
    WithComputedMetrics(injectIntl(WithChallengeMetrics(WrappedComponent, applyFilters))),
    'challenge',
    'challenges',
    'talliedChallenges',
    'challenges',
    includeChallengeInMetrics
  )
