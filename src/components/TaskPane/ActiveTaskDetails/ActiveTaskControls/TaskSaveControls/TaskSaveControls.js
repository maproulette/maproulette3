import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { findIndex as _findIndex } from 'lodash'
import messages from './Messages'
import './TaskSaveControls.css'

export default class TaskSaveControls extends Component {
  render() {
    if (!this.props.user || !this.props.task || this.props.isMinimized) {
      return null
    }

    let saveTaskButton = null
    let unsaveTaskButton = null

    if (_findIndex(this.props.user.savedTasks, {id: this.props.task.id}) !== -1) {
      unsaveTaskButton = (
        <p className="control">
          <button className="button is-small is-outlined save-task-toggle unsave-task"
                  onClick={() => this.props.unsaveTask(this.props.user.id, this.props.task.id)}>
            <FormattedMessage {...messages.unsave} />
          </button>
        </p>
      )
    }
    else {
      saveTaskButton = (
        <p className="control">
          <button className="button is-small is-outlined save-task-toggle save-task"
                  onClick={() => this.props.saveTask(this.props.user.id, this.props.task.id)}>
            <FormattedMessage {...messages.save} />
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
  user: PropTypes.object,
  task: PropTypes.object.isRequired,
  saveTask: PropTypes.func.isRequired,
  unsaveTask: PropTypes.func.isRequired,
}
