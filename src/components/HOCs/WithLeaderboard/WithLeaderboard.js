import React, { Component } from 'react'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _isBoolean from 'lodash/isBoolean'
import _map from 'lodash/map'
import _isEqual from 'lodash/isEqual'
import _get from 'lodash/get'
import { fetchLeaderboard, fetchLeaderboardForUser,
         DEFAULT_LEADERBOARD_COUNT } from '../../../services/Leaderboard/Leaderboard'

/**
 * WithLeaderboard provides leaderboard and leaderboardLoading props containing
 * the current leaderboard data and loading status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithLeaderboard = function(WrappedComponent, initialMonthsPast=1) {
  return class extends Component {
    state = {
      monthsPast: initialMonthsPast,
      countryCode: null,
      leaderboard: null,
      leaderboardLoading: false,
      userLeaderboard: null,
      showingCount: DEFAULT_LEADERBOARD_COUNT,
    }

    leaderboardParams = (numberMonths, countryCode) => {
      const params = new Map([['numberMonths', numberMonths],
                              ['onlyEnabled', true],
                              ['forProjects', null],
                              ['forChallenges', null],
                              ['forUsers', null],
                              ['forCountries', null]])

      if (_isObject(this.props.leaderboardOptions)) {
        if (_isBoolean(this.props.leaderboardOptions.onlyEnabled)) {
          params.set('onlyEnabled', this.props.leaderboardOptions.onlyEnabled)
        }

        if (this.props.leaderboardOptions.filterChallenges &&
            _isArray(this.props.challenges)) {
          params.set('forChallenges', [_map(this.props.challenges, 'id')])
        }

        if (this.props.leaderboardOptions.filterProjects &&
            _isArray(this.props.projects)) {
          params.set('forProjects', [_map(this.props.projects, 'id')])
        }

        if (this.props.leaderboardOptions.filterCountry && countryCode) {
          params.set('forCountries', [countryCode || this.props.countryCode])
        }
      }

      return params.values()
    }

    updateLeaderboard = (numberMonths, countryCode, loadMore = false) => {
      let showingCount = this.state.showingCount

      if (loadMore) {
        showingCount += DEFAULT_LEADERBOARD_COUNT
      }

      this.setState({leaderboardLoading: true, showingCount})

      fetchLeaderboard(...this.leaderboardParams(numberMonths, countryCode), showingCount).then(leaderboard => {
        this.setState({leaderboard, leaderboardLoading: false})
      })

      const userId = _get(this.props, 'user.id')
      if (userId) {
        fetchLeaderboardForUser(userId, 1, ...this.leaderboardParams(numberMonths, countryCode)).then(userLeaderboard => {
          this.setState({userLeaderboard: userLeaderboard})
        })
      }
    }

    setMonthsPast = monthsPast => {
      if (monthsPast !== this.state.monthsPast) {
        this.setState({monthsPast})
        this.updateLeaderboard(monthsPast, this.props.countryCode || this.state.countryCode)
      }
    }

    setCountryCode = countryCode => {
      if (countryCode !== this.state.countryCode) {
        this.setState({countryCode})
        this.updateLeaderboard(this.state.monthsPast, countryCode)
        this.props.history.push(`/country/${countryCode}/leaderboard` )
      }
    }

    loadMore = () => {
      this.updateLeaderboard(this.props.monthsPast || this.state.monthsPast,
                             this.props.countryCode || this.state.countryCode, true)
    }

    componentDidMount() {
      this.updateLeaderboard(this.props.monthsPast || this.state.monthsPast,
                             this.props.countryCode || this.state.countryCode)
    }

    componentDidUpdate(prevProps) {
      // A change to state will also fetch leaderboard data, so we only need to
      // worry about fetching if we're controlled and props change.
      if (this.props.monthsPast !== prevProps.monthsPast ||
          this.props.countryCode !== prevProps.countryCode ||
          !_isEqual(this.props.challenges, prevProps.challenges) ||
          !_isEqual(this.props.projects, prevProps.projects)) {
        this.updateLeaderboard(this.props.monthsPast || this.state.monthsPast,
                               this.props.countryCode || this.state.countryCode)
      }
    }

    render() {
      const moreResults = this.state.leaderboard ? this.state.showingCount <= this.state.leaderboard.length : true

      return <WrappedComponent leaderboard={this.state.leaderboard}
                               leaderboardLoading={this.state.leaderboardLoading}
                               userLeaderboard={this.state.userLeaderboard}
                               monthsPast={this.state.monthsPast}
                               countryCode={this.state.countryCode || this.props.countryCode}
                               setMonthsPast={this.setMonthsPast}
                               setCountryCode={this.setCountryCode}
                               loadMore={this.loadMore}
                               hasMoreResults={moreResults}
                               {...this.props} />
    }
  }
}

export default WithLeaderboard
