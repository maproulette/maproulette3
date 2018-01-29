import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
import TaskFixedControl from '../TaskFixedControl/TaskFixedControl'
import TaskTooHardControl from '../TaskTooHardControl/TaskTooHardControl'
import TaskAlreadyFixedControl from '../TaskAlreadyFixedControl/TaskAlreadyFixedControl'
import TaskCancelEditingControl from '../TaskCancelEditingControl/TaskCancelEditingControl'
import './TaskCompletionStep2.css'

/**
 * TaskCompletionStep2 presents controls for finishing up completion of a
 * task after an editor has been opened. It allows the user to mark that they
 * fixed the task, the task was too hard, it was already fixed by someone else,
 * etc. The user can also cancel and abort completion of the task.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskCompletionStep2 extends Component {
  render() {
    return (
      <div className="active-task-controls__step2 active-task-controls__vertical-control-block">
        {this.props.allowedProgressions.has(TaskStatus.fixed) &&
          <TaskFixedControl {...this.props} />
        }

        {this.props.allowedProgressions.has(TaskStatus.tooHard) &&
          <TaskTooHardControl {...this.props} />
        }

        {this.props.allowedProgressions.has(TaskStatus.alreadyFixed) &&
          <TaskAlreadyFixedControl {...this.props} />
        }

        <TaskCancelEditingControl {...this.props} />
      </div>
    )
  }
}

TaskCompletionStep2.propTypes = {
  /** The task being completed */
  task: PropTypes.object.isRequired,
  /** Invoked if the user cancels and the editor is to be closed */
  cancelEditing: PropTypes.func.isRequired,
  /** The keyboard shortcuts to be offered on this step */
  keyboardShortcutGroups: PropTypes.object.isRequired,
}
