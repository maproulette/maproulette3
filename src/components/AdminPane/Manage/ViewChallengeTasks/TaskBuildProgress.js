import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import FormattedDuration, { TIMER_FORMAT } from 'react-intl-formatted-duration'
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

  state = {
    startTime: Date.now(),
    lastTimerRun: Date.now(),
  }

  clearTimer = () => {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle)
      this.timerHandle = null
    }
  }

  /**
   * Returns the total elapsed seconds since the initial start time
   */
  totalElapsedSeconds = () => {
    return (Date.now() - this.state.startTime) / 1000
  }

  /**
   * Returns the number of seconds until the next status update
   */
  nextUpdateSeconds = () => {
    const secondsRemaining =  (
      new Date(this.state.lastTimerRun + TIMER_INTERVAL).getTime() - Date.now()
    ) / 1000

    return secondsRemaining
  }

  refresh = () => {
    this.props.refreshChallenge()
    this.props.refreshTasks()
    this.setState({lastTimerRun: Date.now()})
  }

  componentDidMount() {
    this.clearTimer()
    this.timerHandle = setInterval(this.refresh, TIMER_INTERVAL)
    this.setState({startTime: Date.now(), lastTimerRun: Date.now()})
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
          <div className="challenge-tasks-status__building-header">
            <h3>
              <FormattedMessage
                {...messages.tasksBuilding}
              /> <BusySpinner lightMode inline />
            </h3>

            <div>
              <FormattedMessage
                {...messages.totalElapsedTime}
              /> <FormattedDuration seconds={this.totalElapsedSeconds()} format={TIMER_FORMAT} />
            </div>
          </div>

          <div className="challenge-tasks-status__build-status">
            <p>
              <FormattedMessage
                {...messages.tasksCreatedCount}
                values={{count: _get(this.props.challenge, 'actions.total', 0)}}
              />
            </p>

            <p>
              <FormattedMessage
                {...messages.refreshStatusLabel}
              /> <FormattedDuration
                seconds={this.nextUpdateSeconds()}
                format={TIMER_FORMAT}
              />
            </p>
          </div>
        </div>
      </div>
    )
  }
}

TaskBuildProgress.propTypes = {
  challenge: PropTypes.object.isRequired,
  refreshChallenge: PropTypes.func.isRequired,
  refreshTasks: PropTypes.func.isRequired,
}
