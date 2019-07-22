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
      loading: false
    }

    updateMetrics(props) {
      this.setState({loading: true})

      props.updateReviewMetrics(_get(props.user, 'id'), _map(props.challenges, 'id')).then(() => {
        this.setState({loading: false})
      })
    }

    componentDidMount() {
      if (_get(this.props.challenges, 'length') > 0) {
        this.updateMetrics(this.props)
      }
    }

    componentDidUpdate(prevProps) {
      if (_get(prevProps.challenges, 'length') === 0 &&
          _get(this.props.challenges, 'length') === 0) {
        return
      }

      if (!_isEqual(_map(prevProps.challenges, 'id'),
                    _map(this.props.challenges, 'id'))) {
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
  updateReviewMetrics: (userId, challengeIds) => {
    return dispatch(fetchReviewMetrics(userId, ReviewTasksType.allReviewedTasks, {filters:{challengeId: challengeIds}}))
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(WithProjectReviewMetrics(WrappedComponent)))
