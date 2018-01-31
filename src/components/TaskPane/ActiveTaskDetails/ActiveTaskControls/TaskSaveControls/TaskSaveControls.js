import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _findIndex from 'lodash/findIndex'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * TaskSaveControls displays controls for saving or unsaving the current task
 * into the user's set of saved tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskSaveControls extends Component {
  render() {
    if (!this.props.user || !this.props.task) {
      return null
    }

    const taskIsSaved =
      _findIndex(this.props.user.savedTasks, {id: this.props.task.id}) !== -1

    let saveTaskButton = null
    let unsaveTaskButton = null

    if (taskIsSaved) {
      unsaveTaskButton = (
        <p className="control">
          <button className={classNames("button save-task-toggle unsave-task",
                                        {"large-and-wide": !this.props.isMinimized,
                                        "icon-only": this.props.isMinimized})}
                  onClick={() => this.props.unsaveTask(this.props.user.id, this.props.task.id)}>
            <span className="control-icon"
                  title={this.props.intl.formatMessage(messages.unsave)}>
              <SvgSymbol viewBox='0 0 20 20' sym="bookmark-icon" />
            </span>
            <span className="control-label">
              <FormattedMessage {...messages.unsave} />
            </span>
          </button>
        </p>
      )
    }
    else {
      saveTaskButton = (
        <p className="control">
          <button className={classNames("button save-task-toggle save-task",
                                        {"large-and-wide": !this.props.isMinimized,
                                        "icon-only": this.props.isMinimized})}
                  onClick={() => this.props.saveTask(this.props.user.id, this.props.task.id)}>
            <span className="control-icon"
                  title={this.props.intl.formatMessage(messages.save)}>
              <SvgSymbol viewBox='0 0 20 20' sym="bookmark-add-icon" />
            </span>
            <span className="control-label">
              <FormattedMessage {...messages.save} />
            </span>
          </button>
        </p>
      )
    }

    return (
      <div className={classNames("task-save-controls", this.props.className)}>
        {saveTaskButton}
        {unsaveTaskButton}
      </div>
    )
  }
}

TaskSaveControls.propTypes = {
  /** The current user */
  user: PropTypes.object,
  /** The current active task */
  task: PropTypes.object.isRequired,
  /** Invoked if the user decides to save the task */
  saveTask: PropTypes.func.isRequired,
  /** Invoked if the user decides to unsave the task */
  unsaveTask: PropTypes.func.isRequired,
}
