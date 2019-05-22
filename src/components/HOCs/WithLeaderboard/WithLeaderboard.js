import React, { Component } from 'react'
import _isArray from 'lodash/isArray'
import _isBoolean from 'lodash/isBoolean'
import _map from 'lodash/map'
import _isEqual from 'lodash/isEqual'
import _clone from 'lodash/clone'
import _get from 'lodash/get'
import _merge from 'lodash/merge'
import queryString from 'query-string'
import { fetchLeaderboard, fetchLeaderboardForUser,
         DEFAULT_LEADERBOARD_COUNT } from '../../../services/Leaderboard/Leaderboard'

/**
 * WithLeaderboard provides leaderboard and leaderboardLoading props containing
 * the current leaderboard data and loading status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithLeaderboard = function(WrappedComponent, initialMonthsPast=1, initialOptions={}) {
  return class extends Component {
    state = {
      leaderboard: null,
      leaderboardLoading: false,
      showingCount: DEFAULT_LEADERBOARD_COUNT,
      leaderboardOptions: initialOptions,
    }

    /** merge the given userLeaderboard in with the main leaderboard */
    mergeInUserLeaderboard = userLeaderboard => {
      if (userLeaderboard && userLeaderboard.length > 0) {
        const merged = _clone(this.state.leaderboard)
        merged.splice(userLeaderboard[0].rank - 1, userLeaderboard.length, ...userLeaderboard)
        this.setState({leaderboard: merged})
      }
    }

    leaderboardParams = (numberMonths, countryCode) => {
      const params = new Map([['numberMonths', numberMonths],
                              ['onlyEnabled', true],
                              ['forProjects', null],
                              ['forChallenges', null],
                              ['forUsers', null],
                              ['forCountries', null]])

      const leaderboardOptions = _merge(this.state.leaderboardOptions, this.props.leaderboardOptions)
      if (leaderboardOptions) {
        if (_isBoolean(leaderboardOptions.onlyEnabled)) {
          params.set('onlyEnabled', leaderboardOptions.onlyEnabled)
        }

        if (leaderboardOptions.filterChallenges &&
            _isArray(this.props.challenges)) {
          params.set('forChallenges', [_map(this.props.challenges, 'id')])
        }

        if (leaderboardOptions.filterProjects &&
            _isArray(this.props.projects)) {
          params.set('forProjects', [_map(this.props.projects, 'id')])
        }

        if (leaderboardOptions.filterCountry && countryCode) {
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

      // If we are filtering by challenges and no challenges are provided then
      // we don't need to go to the server.
      const options = _merge(this.state.leaderboardOptions, this.props.leaderboardOptions)
      if (options.filterChallenges && _isArray(this.props.challenges) &&
          this.props.challenges.length < 1) {
        return
      }

      this.setState({leaderboardLoading: true, showingCount})

      fetchLeaderboard(...this.leaderboardParams(numberMonths, countryCode), showingCount).then(leaderboard => {
        this.setState({leaderboard})

        const userId = _get(this.props, 'user.id')
        if (userId && !this.state.leaderboardOptions.ignoreUser) {
          fetchLeaderboardForUser(userId, 1, ...this.leaderboardParams(numberMonths, countryCode)).then(userLeaderboard => {
            this.mergeInUserLeaderboard(userLeaderboard)
            this.setState({leaderboardLoading: false})
          })
        }
        else {
          this.setState({leaderboardLoading: false})
        }
      })
    }

    setMonthsPast = (monthsPast, skipHistory=false) => {
      if (monthsPast !== this.monthsPast()) {
        const countryCode = this.props.countryCode
        this.updateLeaderboard(monthsPast, countryCode)

        if (!skipHistory) {
          this.props.history.push(`${this.props.location.pathname}?monthsPast=${monthsPast}`)
        }
      }
    }

    setCountryCode = countryCode => {
      if (countryCode === "ALL") {
        this.props.history.push(`/leaderboard?monthsPast=${this.monthsPast()}` )
      }
      else {
        this.props.history.push(`/country/${countryCode}/leaderboard?monthsPast=${this.monthsPast()}` )
      }
    }

    loadMore = () => {
      this.updateLeaderboard(this.monthsPast(), this.props.countryCode, true)
    }

    monthsPast = () => {
      const urlParams = queryString.parse(_get(this.props, 'location.search'))
      if (urlParams.monthsPast)
        return parseInt(urlParams.monthsPast, 10)
      else
        return this.props.monthsPast || initialMonthsPast

    }

    componentDidMount() {
      this.updateLeaderboard(this.monthsPast(), this.props.countryCode)
    }

    componentDidUpdate(prevProps) {
      // A change to state will also fetch leaderboard data, so we only need to
      // worry about fetching if we're controlled and props change.
      if (this.props.monthsPast !== prevProps.monthsPast ||
          this.props.countryCode !== prevProps.countryCode ||
          !_isEqual(this.props.challenges, prevProps.challenges) ||
          !_isEqual(this.props.projects, prevProps.projects)) {
        this.updateLeaderboard(this.monthsPast(), this.props.countryCode)
      }
    }

    render() {
      const moreResults = this.state.leaderboard ? this.state.showingCount <= this.state.leaderboard.length : true

      return <WrappedComponent leaderboard={this.state.leaderboard}
                               leaderboardLoading={this.state.leaderboardLoading}
                               monthsPast={this.monthsPast()}
                               countryCode={this.props.countryCode}
                               setMonthsPast={this.setMonthsPast}
                               setCountryCode={this.setCountryCode}
                               loadMore={this.loadMore}
                               hasMoreResults={moreResults}
                               {...this.props} />
    }
  }
}

export default WithLeaderboard
