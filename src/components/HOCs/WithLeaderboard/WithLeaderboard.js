import React, { Component } from 'react'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _isBoolean from 'lodash/isBoolean'
import _map from 'lodash/map'
import _isEqual from 'lodash/isEqual'
import subMonths from 'date-fns/sub_months'
import { fetchLeaderboard } from '../../../services/Leaderboard/Leaderboard'

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
      leaderboard: null,
      leaderboardLoading: false,
    }

    leaderboardParams = startDate => {
      const params = new Map([['startDate', startDate],
                              ['endDate', null],
                              ['onlyEnabled', true],
                              ['forProjects', null],
                              ['forChallenges', null]])

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
      }

      return params.values()
    }

    updateLeaderboard = startDate => {
      this.setState({leaderboardLoading: true})

      fetchLeaderboard(...this.leaderboardParams(startDate)).then(leaderboard => {
        this.setState({leaderboard, leaderboardLoading: false})
      })
    }

    monthsPastStartDate = monthsPast => subMonths(new Date(), monthsPast)

    setMonthsPast = monthsPast => {
      if (monthsPast !== this.state.monthsPast) {
        this.setState({monthsPast})
        this.updateLeaderboard(this.monthsPastStartDate(monthsPast))
      }
    }

    componentDidMount() {
      this.updateLeaderboard(this.monthsPastStartDate(this.props.monthsPast ||
                                                      this.state.monthsPast))
    }

    componentDidUpdate(prevProps) {
      // A change to state will also fetch leaderboard data, so we only need to
      // worry about fetching if we're controlled and props change.
      if (this.props.monthsPast !== prevProps.monthsPast ||
          !_isEqual(this.props.challenges, prevProps.challenges) ||
          !_isEqual(this.props.projects, prevProps.projects)) {
        this.updateLeaderboard(this.monthsPastStartDate(this.props.monthsPast ||
                                                        this.state.monthsPast))
      }
    }

    render() {
      return <WrappedComponent leaderboard={this.state.leaderboard}
                               leaderboardLoading={this.state.leaderboardLoading}
                               monthsPast={this.state.monthsPast}
                               setMonthsPast={this.setMonthsPast}
                               {...this.props} />
    }
  }
}

export default WithLeaderboard
