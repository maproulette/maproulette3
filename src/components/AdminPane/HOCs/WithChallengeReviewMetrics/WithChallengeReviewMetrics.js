import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _pickBy from 'lodash/pickBy'
import _merge from 'lodash/merge'
import { fetchReviewMetrics, ReviewTasksType }
       from '../../../../services/Task/TaskReview/TaskReview'
import WithCurrentUser from '../../../HOCs/WithCurrentUser/WithCurrentUser'

/**
 * WithChallengeReviewMetrics retrieves review metrics for the challenge tasks
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithChallengeReviewMetrics = function(WrappedComponent) {
  return class extends Component {
    state = {
      updateAvailable: true,
      loading: false,
    }

    updateMetrics(props) {
      this.setState({updateAvailable: false, loading: true})

      const filters = {challengeId: _get(props.challenge, 'id')}
       _merge(filters, _get(props.searchFilters, 'filters'))

      const criteria = {filters}
      criteria.invertFields = _get(props.searchCriteria, 'filters.invertFields')

      if (props.includeTaskStatuses) {
        criteria.filters.status = _keys(_pickBy(props.includeTaskStatuses, v => v)).join(',')
      }
      if (props.includeTaskReviewStatuses) {
        criteria.filters.reviewStatus = _keys(_pickBy(props.includeTaskReviewStatuses, v => v)).join(',')
      }
      if (props.includeMetaReviewStatuses) {
        criteria.filters.metaReviewStatus = _keys(_pickBy(props.includeMetaReviewStatuses, v => v)).join(',')
      }
      if (props.includeTaskPriorities) {
        criteria.filters.priorities =_keys(_pickBy(props.includeTaskPriorities, v => v)).join(',')
      }

      props.updateReviewMetrics(_get(props.user, 'id'), criteria).then((entity) => {
        const reviewMetrics = entity
        this.setState({loading: false, reviewMetrics: reviewMetrics})
      })
    }

    componentDidUpdate(prevProps) {
      if (this.state.updateAvailable) {
        return // nothing to do
      }

      if (_get(prevProps.challenge, 'id') !== _get(this.props.challenge, 'id')) {
        this.setState({updateAvailable: true})
        return
      }

      if (this.props.includeTaskStatuses !== prevProps.includeTaskStatuses) {
        this.setState({updateAvailable: true})
        return
      }

      if (this.props.includeTaskReviewStatuses !== prevProps.includeTaskReviewStatuses) {
        this.setState({updateAvailable: true})
        return
      }

      if (this.props.includeTaskPriorities !== prevProps.includeTaskPriorities) {
        this.setState({updateAvailable: true})
        return
      }

      if (_get(this.props.searchFilters, 'filters') !== _get(prevProps.searchFilters, 'filters')) {
        this.setState({updateAvailable: true})
        return
      }
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ['updateReviewMetrics'])}
          reviewMetrics = {this.state.reviewMetrics || this.props.allReviewMetrics}
          metricsUpdateAvailable = {this.state.updateAvailable}
          refreshMetrics = {() => this.updateMetrics(this.props)}
          loading={this.state.loading}
        />
      )
    }
  }
}

const mapStateToProps = state => (
  {reviewMetrics: _get(state, 'currentReviewTasks.metrics.reviewActions'),
   reviewMetricsByPriority: _get(state, 'currentReviewTasks.metrics.priorityReviewActions'),
   reviewMetricsByTaskStatus: _get(state, 'currentReviewTasks.metrics.statusReviewActions') }
)

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateReviewMetrics: (userId, criteria) => {
    return dispatch(fetchReviewMetrics(userId, ReviewTasksType.allReviewedTasks, criteria))
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(WithChallengeReviewMetrics(WrappedComponent)))
