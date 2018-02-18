import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { TaskLoadMethod,
         messagesByLoadMethod }
       from '../../../../../services/Task/TaskLoadMethod/TaskLoadMethod'
import messages from './Messages'
import './TaskRandomnessControl.css'

/**
 * TaskRandomnessControl displays a switch for toggling tracking of the current
 * task, saving/unsaving it into the user's set of saved tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskRandomnessControl extends Component {
  loadBy = loadMethod =>
    this.props.setTaskLoadBy(this.props.challengeId, loadMethod)

  render() {
    if (!this.props.user || !this.props.task) {
      return null
    }

    // Don't show control in minimized mode.
    if (this.props.isMinimized) {
      return null
    }

    return (
      <div className={classNames("task-randomness-control", this.props.className)}>
        <div className="control">
          <span className="task-randomness-control__prompt">
            <FormattedMessage {...messages.taskLoadByLabel} />
          </span>

          <label className="radio">
            <input type="radio" name="randomnessPreference"
                   className="task-randomness-control__random-option"
                   checked={this.props.taskLoadBy === TaskLoadMethod.random}
                   onChange={() => this.loadBy(TaskLoadMethod.random)} />
            <FormattedMessage {...messagesByLoadMethod[TaskLoadMethod.random]} />
          </label>
          <label className="radio">
            <input type="radio" name="randomnessPreference" 
                   className="task-randomness-control__proximity-option"
                   checked={this.props.taskLoadBy === TaskLoadMethod.proximity}
                   onChange={() => this.loadBy(TaskLoadMethod.proximity)} />
            <FormattedMessage {...messagesByLoadMethod[TaskLoadMethod.proximity]} />
          </label>
        </div>
      </div>
    )
  }
}

TaskRandomnessControl.propTypes = {
  /** The current user */
  user: PropTypes.object,
  /** The current active challenge */
  challengeId: PropTypes.number.isRequired,
  /** Current setting of whether to load tasks randomly or by proximity */
  taskLoadBy: PropTypes.string.isRequired,
  /** Invoked if the user alters the load-by setting  */
  setTaskLoadBy: PropTypes.func.isRequired,
}
