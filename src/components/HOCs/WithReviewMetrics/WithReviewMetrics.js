import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import { fetchReviewMetrics }
       from '../../../services/Task/TaskReview/TaskReview'
import WithCurrentUser from '../WithCurrentUser/WithCurrentUser'

/**
 * WithReviewMetrics retrieves metrics for the currently filtered review tasks
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithReviewMetrics = function(WrappedComponent) {
  return class extends Component {
    state = {
      loading: false
    }

    updateMetrics(props) {
      this.setState({loading: true})

      props.updateReviewMetrics(_get(props.user, 'id'),
                                props.reviewTasksType,
                                props.reviewCriteria).then(() => {
        this.setState({loading: false})
      })
    }

    componentDidMount() {
      this.updateMetrics(this.props)
    }

    componentDidUpdate(prevProps) {
      if (prevProps.reviewTasksType !== this.props.reviewTasksType) {
        this.updateMetrics(this.props)
      }

      if (prevProps.reviewCriteria !== this.props.reviewCriteria) {
        this.updateMetrics(this.props)
      }
    }

    render() {
      return (
        <WrappedComponent reviewMetrics = {this.props.reviewMetrics}
                          reviewMetricsByPriority = {this.props.reviewMetricsByPriority}
                          loading={this.state.loading}
                          {..._omit(this.props, ['updateReviewMetrics'])} />)
    }
  }
}

const mapStateToProps = state => {
  return ({ reviewMetrics: _get(state, 'currentReviewTasks.metrics.reviewActions'),
            reviewMetricsByPriority: _get(state, 'currentReviewTasks.metrics.priorityReviewActions') })
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateReviewMetrics: (userId, reviewTasksType, searchCriteria={}) => {
    return dispatch(fetchReviewMetrics(userId, reviewTasksType, searchCriteria))
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(WithReviewMetrics(WrappedComponent)))
