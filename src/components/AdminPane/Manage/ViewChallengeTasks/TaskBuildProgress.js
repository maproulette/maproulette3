import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import FormattedDuration, { TIMER_FORMAT } from 'react-intl-formatted-duration'
import parse from 'date-fns/parse'
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
    startTime: new Date(),
  }

  clearTimer = () => {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle)
      this.timerHandle = null
    }
  }

  /**
   * Returns the total elapsed seconds since the start time (usually the challenge
   * modification date)
   */
  totalElapsedSeconds = () => {
    return (Date.now() - this.state.startTime) / 1000
  }

  /**
   * Returns the number of seconds until the next status update
   */
  nextUpdateSeconds = () => {
    return (
      new Date(this.props.challenge._meta.fetchedAt + TIMER_INTERVAL).getTime() - Date.now()
    ) / 1000
  }

  refresh = () => {
    this.props.refreshChallenge()
    this.props.refreshTasks()
  }

  componentDidMount() {
    this.clearTimer()
    this.timerHandle =
      setInterval(this.props.refresh, TIMER_INTERVAL)

    if (this.props.challenge.modified) {
      this.setState({startTime: parse(this.props.challenge.modified)})
    }
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
