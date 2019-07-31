import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _pickBy from 'lodash/pickBy'
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
      loading: false
    }

    updateMetrics(props) {
      this.setState({loading: true})

      const criteria = {filters:{challengeId: _get(props.challenge, 'id')}}
      if (props.includeTaskStatuses) {
        criteria.filters.status = _keys(_pickBy(props.includeTaskStatuses)).join(',')
      }
      if (props.includeTaskReviewStatuses) {
        criteria.filters.reviewStatus = _keys(_pickBy(props.includeTaskReviewStatuses)).join(',')
      }
      if (props.includeTaskPriorities) {
        criteria.filters.priorities =_keys(_pickBy(props.includeTaskPriorities)).join(',')
      }

      props.updateReviewMetrics(_get(props.user, 'id'), criteria).then((entity) => {
        const reviewMetrics = entity
        this.setState({loading: false, reviewMetrics: reviewMetrics})
      })
    }

    componentDidMount() {
      this.updateMetrics(this.props)
    }

    componentDidUpdate(prevProps) {
      if (_get(prevProps.challenge, 'id') !== _get(this.props.challenge, 'id')) {
        this.updateMetrics(this.props)
      }

      if (this.props.includeTaskStatuses !== prevProps.includeTaskStatuses) {
        this.updateMetrics(this.props)
      }

      if (this.props.includeTaskReviewStatuses !== prevProps.includeTaskReviewStatuses) {
        this.updateMetrics(this.props)
      }

      if (this.props.includeTaskPriorities !== prevProps.includeTaskPriorities) {
        this.updateMetrics(this.props)
      }
    }

    render() {
      return (
        <WrappedComponent reviewMetrics = {this.state.reviewMetrics ||
                                           this.props.allReviewMetrics}
                          loading={this.state.loading}
                          {..._omit(this.props, ['updateReviewMetrics'])} />)
    }
  }
}

const mapStateToProps = state => ({allReviewMetrics: _get(state, 'currentReviewTasks.metrics')})

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateReviewMetrics: (userId, criteria) => {
    return dispatch(fetchReviewMetrics(userId, ReviewTasksType.allReviewedTasks, criteria))
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(WithChallengeReviewMetrics(WrappedComponent)))
