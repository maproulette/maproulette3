import React, { Component } from 'react'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _isBoolean from 'lodash/isBoolean'
import _map from 'lodash/map'
import { fetchLeaderboard }
       from '../../../services/Leaderboard/Leaderboard'

/**
 * WithLeaderboard provides leaderboard and leaderboardLoading props containing
 * the current leaderboard data and loading status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithLeaderboard = function(WrappedComponent, initialStartDate) {
  return class extends Component {
    state = {
      startDate: initialStartDate,
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
      }

      return params.values()
    }

    updateLeaderboard = startDate => {
      this.setState({leaderboardLoading: true})

      fetchLeaderboard(...this.leaderboardParams(startDate)).then(leaderboard => {
        this.setState({leaderboard, leaderboardLoading: false})
      })
    }

    setLeaderboardStartDate = startDate => {
      if (startDate !== this.state.startDate) {
        this.setState({startDate})
        this.updateLeaderboard(startDate)
      }
    }

    componentDidMount() {
      this.updateLeaderboard(this.state.startDate)
    }

    render() {
      return <WrappedComponent leaderboard={this.state.leaderboard}
                               leaderboardLoading={this.state.leaderboardLoading}
                               setLeaderboardStartDate={this.setLeaderboardStartDate}
                               {...this.props} />
    }
  }
}
  
export default WithLeaderboard
