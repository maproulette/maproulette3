import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
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

      props.updateReviewMetrics(_get(props.user, 'id'), _get(props.challenge, 'id')).then(() => {
        this.setState({loading: false})
      })
    }

    componentDidMount() {
      this.updateMetrics(this.props)
    }

    componentDidUpdate(prevProps) {
      if (_get(prevProps.challenge, 'id') !== _get(this.props.challenge, 'id')) {
        this.updateMetrics(this.props)
      }
    }

    render() {
      return (
        <WrappedComponent reviewMetrics = {this.props.reviewMetrics}
                          loading={this.state.loading}
                          {..._omit(this.props, ['updateReviewMetrics'])} />)
    }
  }
}

const mapStateToProps = state => ({ reviewMetrics: _get(state, 'currentReviewTasks.metrics') })

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateReviewMetrics: (userId, challengeId) => {
    return dispatch(fetchReviewMetrics(userId, ReviewTasksType.allReviewedTasks, {filters:{challengeId}}))
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(WithChallengeReviewMetrics(WrappedComponent)))
