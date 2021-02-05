import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isEqual from 'lodash/isEqual'
import { fetchReviewMetrics, ReviewTasksType }
       from '../../../../services/Task/TaskReview/TaskReview'
import WithCurrentUser from '../../../HOCs/WithCurrentUser/WithCurrentUser'

/**
 * WithProjectReviewMetrics retrieves review metrics for the challenges
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithProjectReviewMetrics = function(WrappedComponent) {
  return class extends Component {
    state = {
      updateAvailable: true,
      loading: false,
    }

    getChallengeIds(props) {
      let challenges = _map(props.challenges, 'id')

      // Filter only tallied challenges if available
      if (props.talliedChallenges && props.project) {
        challenges = props.talliedChallenges(props.project.id)
      }

      return challenges
    }

    refreshMetrics(props) {
      this.setState({updateAvailable: false, loading: true})

      const challengeIds = this.getChallengeIds(props)
      props.refreshReviewMetrics(_get(props.user, 'id'), challengeIds,
        _get(props.project, 'id')).then(() => {
        this.setState({loading: false, currentChallengeIds: challengeIds})
      })
    }

    componentDidUpdate(prevProps) {
      if (!this.state.loading && !this.state.updateAvailable &&
          !_isEqual(this.getChallengeIds(this.props),
                    this.state.currentChallengeIds)) {
        this.setState({updateAvailable: true})
      }
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ['refreshReviewMetrics'])}
          reviewMetrics = {this.props.reviewMetrics}
          metricsUpdateAvailable = {this.state.updateAvailable}
          refreshMetrics = {() => this.refreshMetrics(this.props)}
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
  refreshReviewMetrics: (userId, challengeIds, projectId) => {
    return dispatch(fetchReviewMetrics(userId, ReviewTasksType.allReviewedTasks,
      {filters:{challengeId: challengeIds, projectId: projectId}}))
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(WithProjectReviewMetrics(WrappedComponent)))
