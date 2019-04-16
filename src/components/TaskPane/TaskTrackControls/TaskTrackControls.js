import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _findIndex from 'lodash/findIndex'
import _noop from 'lodash/noop'
import messages from './Messages'

/**
 * TaskTrackControls displays a checkbox for toggling tracking of the current
 * task, saving/unsaving it into the user's set of saved tasks
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskTrackControls extends Component {
  taskIsTracked = () => {
    return _findIndex(this.props.user.savedTasks,
                      {id: this.props.task.id}) !== -1
  }

  toggleSaved = () => {
    if (this.taskIsTracked()) {
      this.props.unsaveTask(this.props.user.id, this.props.task.id)
    }
    else {
      this.props.saveTask(this.props.user.id, this.props.task.id)
    }
  }

  render() {
    if (!this.props.user || !this.props.task) {
      return null
    }

    return (
      <div>
        <div onClick={this.toggleSaved}>
          <input
            type="checkbox"
            className="mr-mr-2"
            onChange={() => _noop}
            checked={this.taskIsTracked()}
          />
          <label>
            <FormattedMessage {...messages.trackLabel } />
          </label>
        </div>
      </div>
    )
  }
}

TaskTrackControls.propTypes = {
  /** The current user */
  user: PropTypes.object,
  /** The current active task */
  task: PropTypes.object.isRequired,
  /** Invoked if the user decides to save/track the task */
  saveTask: PropTypes.func.isRequired,
  /** Invoked if the user decides to unsave/untrack the task */
  unsaveTask: PropTypes.func.isRequired,
}
