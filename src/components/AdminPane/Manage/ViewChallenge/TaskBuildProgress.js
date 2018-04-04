import React, { Component } from 'react'
import { FormattedMessage,
         FormattedRelative } from 'react-intl'
import _get from 'lodash/get'
import { ChallengeStatus }
       from '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import messages from './Messages'

const TIMER_INTERVAL = 10000 // 10 seconds

/**
 * TaskBuildProgress displays the current number of tasks built so far
 * and refreshes the challenge data every 10 seconds.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskBuildProgress extends Component {
  timerHandle = null

  clearTimer = () => {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle)
      this.timerHandle = null
    }
  }

  componentDidMount() {
    this.clearTimer()
    this.timerHandle =
      setInterval(this.props.refreshChallengeStatus, TIMER_INTERVAL)
  }

  componentWillUnmount() {
    this.clearTimer()
  }

  render() {
    if (this.props.challenge.status !== ChallengeStatus.building) {
      return null
    }

    return (
      <div>
        <div className="challenge-tasks-status">
          <h3><FormattedMessage {...messages.tasksBuilding} /></h3>

          <div className="since-when">
            <FormattedMessage {...messages.tasksCreatedCount}
                              values={{count: _get(this.props.challenge,
                                'actions.total', 0)}}
            /> <FormattedMessage {...messages.asOf}
            /> <FormattedRelative
                 value={new Date(this.props.challenge._meta.fetchedAt)}
                 updateInterval={1000} />

            <div className="pane-loading">
              <BusySpinner />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
