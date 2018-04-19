import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchLeaderboard }
       from '../../../services/Leaderboard/Leaderboard'
import _get from 'lodash/get'
import _omit from 'lodash/omit'

/**
 * WithLeaderboard provides leaderboard and leaderboardLoading props containing
 * the current leaderboard data and loading status from the redux store.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithLeaderboard = function(WrappedComponent) {
  return class extends Component {
    state = {
      startDate: null,
    }

    setLeaderboardStartDate = startDate => {
      this.setState({startDate})
    }

    componentDidMount() {
      this.props.fetchLeaderboard()
    }

    componentWillUpdate(nextProps, nextState) {
      if (nextState.startDate !== this.state.startDate) {
        this.props.fetchLeaderboard(nextState.startDate)
      }
    }

    render() {
      return <WrappedComponent leaderboard={_get(this.props, 'leaderboard.leaderboard')}
                               leaderboardLoading={_get(this.props, 'leaderboard.loading')}
                               setLeaderboardStartDate={this.setLeaderboardStartDate}
                               {..._omit(this.props, ['leaderboard', 'fetchLeaderboard'])} />
    }
  }
}
  
export const mapStateToProps = state => ({
  leaderboard: state.currentLeaderboard,
})

export const mapDispatchToProps = dispatch => ({
  fetchLeaderboard: (startDate=null) => dispatch(fetchLeaderboard(startDate))
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithLeaderboard(WrappedComponent))
