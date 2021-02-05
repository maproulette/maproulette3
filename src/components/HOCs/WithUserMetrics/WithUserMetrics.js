import format from 'date-fns/format'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import { fetchLeaderboardForUser } from '../../../services/Leaderboard/Leaderboard'
import { fetchUserMetrics } from '../../../services/User/User'
import { CUSTOM_RANGE, ALL_TIME }
  from '../../../components/PastDurationSelector/PastDurationSelector'

/**
 * WithUserMetrics retrieves metrics for the current user
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithUserMetrics = function(WrappedComponent, userProp) {
  return class extends Component {
    state = {
      loading: false,
      tasksCompletedMonthsPast: ALL_TIME,
      tasksReviewedMonthsPast: ALL_TIME,
      tasksReviewerMonthsPast: ALL_TIME,
      tasksCompletedDateRange: [],  // Range will be [start, end] when set
      tasksReviewedDateRange: [],
      tasksReviewerDateRange: [],
    }

    updateAllMetrics(props) {
      this.setState({loading: true})

      if ( this.props[userProp] &&
          (!_get(this.props[userProp], 'settings.leaderboardOptOut') ||
           _get(this.props[userProp], 'id') === _get(this.props.currentUser, 'userId'))) {
        fetchLeaderboardForUser(this.props[userProp].id, 0, -1).then(userLeaderboard => {
          this.setState({loading: false, leaderboardMetrics: userLeaderboard[0]})
        })

        this.updateUserMetrics(props)
      }
    }

    updateUserMetrics(props) {
      if (!_get(this.props[userProp], 'settings.leaderboardOptOut') ||
           _get(this.props[userProp], 'id') === _get(this.props.currentUser, 'userId')) {

        const startDate = _get(this.state.tasksCompletedDateRange, 'length', 0) === 2 ?
          format(this.state.tasksCompletedDateRange[0], 'YYYY-MM-DD') : null

        const endDate = _get(this.state.tasksCompletedDateRange, 'length', 0) === 2 ?
          format(this.state.tasksCompletedDateRange[1], 'YYYY-MM-DD') : null

        const reviewStart = _get(this.state.tasksReviewedDateRange, 'length', 0) === 2 ?
          format(this.state.tasksReviewedDateRange[0], 'YYYY-MM-DD') : null

        const reviewEnd = _get(this.state.tasksReviewedDateRange, 'length', 0) === 2 ?
          format(this.state.tasksReviewedDateRange[1], 'YYYY-MM-DD') : null

        const reviewerStart = _get(this.state.tasksReviewerDateRange, 'length', 0) === 2 ?
          format(this.state.tasksReviewerDateRange[0], 'YYYY-MM-DD') : null

        const reviewerEnd = _get(this.state.tasksReviewerDateRange, 'length', 0) === 2 ?
          format(this.state.tasksReviewerDateRange[1], 'YYYY-MM-DD') : null

        fetchUserMetrics(this.props[userProp].id,
           this.state.tasksCompletedMonthsPast,
           this.state.tasksReviewedMonthsPast,
           this.state.tasksReviewerMonthsPast,
           startDate, endDate,
           reviewStart, reviewEnd,
           reviewerStart, reviewerEnd
        ).then(metrics => {
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
          tasksCompletedDateRange: [],
        })
      }
    }

    setTasksCompletedDateRange = (startDate, endDate) => {
      this.setState({
        tasksCompletedDateRange: [startDate, endDate],
        tasksCompletedMonthsPast: CUSTOM_RANGE,
      })
    }

    setTasksReviewedMonthsPast = monthsPast => {
      if (this.state.tasksReviewedMonthsPast !== monthsPast) {
        this.setState({
          tasksReviewedMonthsPast: monthsPast,
          tasksReviewedDateRange: [],
        })
      }
    }

    setTasksReviewedDateRange = (startDate, endDate) => {
      this.setState({
        tasksReviewedDateRange: [startDate, endDate],
        tasksReviewedMonthsPast: CUSTOM_RANGE
      })
    }

    setTasksReviewerMonthsPast = monthsPast => {
      if (this.state.tasksReviewerMonthsPast !== monthsPast) {
        this.setState({
          tasksReviewerMonthsPast: monthsPast,
          tasksReviewerDateRange: [],
        })
      }
    }

    setTasksReviewerDateRange = (startDate, endDate) => {
      this.setState({
        tasksReviewerDateRange: [startDate, endDate],
        tasksReviewerMonthsPast: CUSTOM_RANGE
      })
    }

    componentDidMount() {
      if (this.props[userProp]) {
        this.updateAllMetrics(this.props)
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevProps[userProp] !== this.props[userProp]) {
        this.updateAllMetrics(this.props)
      }

      else if (prevState.tasksReviewedMonthsPast !== this.state.tasksReviewedMonthsPast &&
               this.state.tasksReviewedMonthsPast !== CUSTOM_RANGE) {
        this.updateUserMetrics(this.props)
      }

      else if (prevState.tasksReviewerMonthsPast !== this.state.tasksReviewerMonthsPast &&
               this.state.tasksReviewerMonthsPast !== CUSTOM_RANGE) {
        this.updateUserMetrics(this.props)
      }

      else if (prevState.tasksCompletedMonthsPast !== this.state.tasksCompletedMonthsPast &&
               this.state.tasksCompletedMonthsPast !== CUSTOM_RANGE) {
        this.updateUserMetrics(this.props)
      }

      else if (this.state.tasksCompletedMonthsPast === CUSTOM_RANGE &&
               prevState.tasksCompletedDateRange !== this.state.tasksCompletedDateRange) {
        this.updateUserMetrics(this.props)
      }

      else if (this.state.tasksReviewedMonthsPast === CUSTOM_RANGE &&
               prevState.tasksReviewedDateRange !== this.state.tasksReviewedDateRange) {
        this.updateUserMetrics(this.props)
      }

      else if (this.state.tasksReviewerMonthsPast === CUSTOM_RANGE &&
               prevState.tasksReviewerDateRange !== this.state.tasksReviewerDateRange) {
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
                          setTasksCompletedDateRange={this.setTasksCompletedDateRange}
                          tasksReviewedMonthsPast={this.state.tasksReviewedMonthsPast}
                          setTasksReviewedMonthsPast={this.setTasksReviewedMonthsPast}
                          setTasksReviewedDateRange={this.setTasksReviewedDateRange}
                          tasksReviewerMonthsPast={this.state.tasksReviewerMonthsPast}
                          setTasksReviewerMonthsPast={this.setTasksReviewerMonthsPast}
                          setTasksReviewerDateRange={this.setTasksReviewerDateRange}
                          loading={this.state.loading}
                          {..._omit(this.props, ['updateLeaderboardMetrics'])} />)
    }
  }
}

const mapStateToProps = state => ({})

const mapDispatchToProps = (dispatch, ownProps) => ({
})

export default (WrappedComponent, userProp="targetUser") =>
  connect(mapStateToProps, mapDispatchToProps)(WithUserMetrics(WrappedComponent, userProp))
