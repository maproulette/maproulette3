import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { messagesByStatus,
         isCompleted } from '../../../../../services/Task/TaskStatus/TaskStatus'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './TaskDoneControls.css'

/**
 * TaskDoneControls presents controls for interacting with a task that has
 * already been marked with some sort of completed status. It displays the
 * existing status and at least a button for moving on to another next task.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskDoneControls extends Component {
  render() {
    if (!this.props.task || !isCompleted(this.props.task.status)) {
      return null
    }

    const statusMessage =
      this.props.intl.formatMessage(messages.completedPrompt) +
      ' ' +
      this.props.intl.formatMessage(messagesByStatus[this.props.task.status])

    return (
      <div className={classNames("task-done-controls",
                                 {"is-minimized": this.props.isMinimized})}>
        {!this.props.isMinimized &&
          <div className="task-done-controls--task-status-message">
            {statusMessage}
          </div>
        }

        <div className="has-centered-children">
          <a className="is-text task-done-controls__next"
             title={this.props.intl.formatMessage(messages.nextTask)}
             onClick={() => this.props.nextTask(this.props.task.parent.id, this.props.task.id)}>
            {!this.props.isMinimized && <FormattedMessage {...messages.nextTask} />}
            <SvgSymbol viewBox='0 0 20 20' sym="forward-icon" />
          </a>
        </div>
      </div>
    )
  }
}

TaskDoneControls.propTypes = {
  /** The current task */
  task: PropTypes.object,
  /** Invoked if the user wishes to move to a new task */
  nextTask: PropTypes.func.isRequired,
}
