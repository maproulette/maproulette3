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
const TASKS_UPDATING_MESSAGE = "Updating Task Statuses"

const TaskStatusOverview = ({ actions }) => {
  return (
    <div>
      <div><FormattedMessage {...messages.actionCreated} />: {actions.available}</div>
      <div><FormattedMessage {...messages.actionFixed} />: {actions.fixed}</div>
      <div><FormattedMessage {...messages.actionNotAnIssue} />: {actions.falsePositive}</div>
      <div><FormattedMessage {...messages.actionSkipped} />: {actions.skipped}</div>
      <div><FormattedMessage {...messages.actionAlreadyFixed} />: {actions.alreadyFixed}</div>
      <div><FormattedMessage {...messages.actionTooHard} />: {actions.tooHard}</div>
      <div><FormattedMessage {...messages.actionDisabled} />: {actions.disabled}</div>
    </div>
  )
}

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

    const taskCount = _get(this.props.challenge, 'actions.total', 0)

    if (this.props.challenge.statusMessage === TASKS_UPDATING_MESSAGE) {
      return (
        <div>
          <div>
            <div className="mr-flex mr-justify-between mr-items-center mr-w-full mr-mb-8">
              <h3 className="mr-text-white">
                <FormattedMessage
                  {...messages.tasksUpdating}
                /> <BusySpinner inline />
              </h3>
  
              <div>
                <FormattedMessage
                  {...messages.totalElapsedTime}
                /> <FormattedDuration seconds={this.totalElapsedSeconds()} format={TIMER_FORMAT} />
              </div>
            </div>
  
            <div className="mr-text-lg">
              <div className="mr-mb-2"/>
              <FormattedMessage {...messages.refreshStatusLabel} /> 
              <span className="mr-text-orange mr-ml-1">
              <FormattedDuration
                seconds={this.nextUpdateSeconds()}
                format={TIMER_FORMAT}
              />
              </span>
            </div>
            <div className="mr-text-lg mr-mt-3">
              <TaskStatusOverview actions={_get(this.props.challenge, 'actions', {})} />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div>
        <div>
          <div className="mr-flex mr-justify-between mr-items-center mr-w-full mr-mb-8">
            <h3 className="mr-text-white">
              <FormattedMessage
                {...messages.tasksBuilding}
              /> <BusySpinner inline />
            </h3>

            <div>
              <FormattedMessage
                {...messages.totalElapsedTime}
              /> <FormattedDuration seconds={this.totalElapsedSeconds()} format={TIMER_FORMAT} />
            </div>
          </div>

          <div className="mr-text-lg">
            <span className="mr-text-xl mr-text-pink">
              {taskCount}
            </span> <FormattedMessage
              {...messages.tasksCreatedCount}
            /> <FormattedMessage
              {...messages.refreshStatusLabel}
            /> <span className="mr-text-orange">
              <FormattedDuration
                seconds={this.nextUpdateSeconds()}
                format={TIMER_FORMAT}
              />
            </span>
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
