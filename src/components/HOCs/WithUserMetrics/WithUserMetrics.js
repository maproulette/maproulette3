import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import { fetchLeaderboardForUser } from '../../../services/Leaderboard/Leaderboard'
import { fetchUserMetrics } from '../../../services/User/User'

/**
 * WithUserMetrics retrieves metrics for the current user
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithUserMetrics = function(WrappedComponent) {
  return class extends Component {
    state = {
      loading: false,
      tasksCompletedMonthsPast: -1,
      tasksReviewedMonthsPast: -1,
      tasksReviewerMonthsPast: -1,
    }

    updateAllMetrics(props) {
      this.setState({loading: true})

      if ( this.props.targetUser &&
          (!_get(this.props.targetUser, 'settings.leaderboardOptOut') ||
           _get(this.props.targetUser, 'id') === _get(this.props.currentUser, 'userId'))) {
        fetchLeaderboardForUser(this.props.targetUser.id, 0, -1).then(userLeaderboard => {
          this.setState({loading: false, leaderboardMetrics: userLeaderboard[0]})
        })

        this.updateUserMetrics(props)
      }
    }

    updateUserMetrics(props) {
      if (!_get(this.props.targetUser, 'settings.leaderboardOptOut') ||
           _get(this.props.targetUser, 'id') === _get(this.props.currentUser, 'userId')) {
        fetchUserMetrics(this.props.targetUser.id,
                         this.state.tasksCompletedMonthsPast,
                         this.state.tasksReviewedMonthsPast,
                         this.state.tasksReviewerMonthsPast).then(metrics => {
          this.setState({taskMetrics: metrics.tasks,
                         reviewMetrics: metrics.reviewTasks,
                         reviewerMetrics: metrics.asReviewerTasks})
        })
      }
    }

    setTasksCompletedMonthsPast = monthsPast => {
      if (this.state.tasksCompletedMonthsPast !== monthsPast) {
        this.setState({
          tasksCompletedMonthsPast: monthsPast,
        })
      }
    }

    setTasksReviewedMonthsPast = monthsPast => {
      if (this.state.tasksReviewedMonthsPast !== monthsPast) {
        this.setState({
          tasksReviewedMonthsPast: monthsPast,
        })
      }
    }

    setTasksReviewerMonthsPast = monthsPast => {
      if (this.state.tasksReviewerMonthsPast !== monthsPast) {
        this.setState({
          tasksReviewerMonthsPast: monthsPast,
        })
      }
    }

    componentDidMount() {
      if (this.props.targetUser) {
        this.updateAllMetrics(this.props)
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevProps.targetUser !== this.props.targetUser) {
        this.updateAllMetrics(this.props)
      }

      if (prevState.tasksReviewedMonthsPast !== this.state.tasksReviewedMonthsPast) {
        this.updateUserMetrics(this.props)
      }

      if (prevState.tasksReviewerMonthsPast !== this.state.tasksReviewerMonthsPast) {
        this.updateUserMetrics(this.props)
      }

      if (prevState.tasksCompletedMonthsPast !== this.state.tasksCompletedMonthsPast) {
        this.updateUserMetrics(this.props)
      }
    }

    render() {
      return (
        <WrappedComponent leaderboardMetrics={this.state.leaderboardMetrics}
                          taskMetrics={this.state.taskMetrics}
                          reviewMetrics={this.state.reviewMetrics}
                          reviewerMetrics={this.state.reviewerMetrics}
                          tasksCompletedMonthsPast={this.state.tasksCompletedMonthsPast}
                          setTasksCompletedMonthsPast={this.setTasksCompletedMonthsPast}
                          tasksReviewedMonthsPast={this.state.tasksReviewedMonthsPast}
                          setTasksReviewedMonthsPast={this.setTasksReviewedMonthsPast}
                          tasksReviewerMonthsPast={this.state.tasksReviewerMonthsPast}
                          setTasksReviewerMonthsPast={this.setTasksReviewerMonthsPast}
                          loading={this.state.loading}
                          {..._omit(this.props, ['updateLeaderboardMetrics'])} />)
    }
  }
}

const mapStateToProps = state => ({})

const mapDispatchToProps = (dispatch, ownProps) => ({
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithUserMetrics(WrappedComponent))
