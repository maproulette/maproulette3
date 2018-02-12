import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _findIndex from 'lodash/findIndex'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * TaskTrackControls displays a switch for toggling tracking of the current
 * task, saving/unsaving it into the user's set of saved tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskTrackControls extends Component {
  taskIsTracked = () =>
    _findIndex(this.props.user.savedTasks,
               {id: this.props.task.id}) !== -1

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

    let control = null

    // Normally we show a switch for toggling, but in minimized mode we show an
    // icon control.
    if (this.props.isMinimized) {
      let label = null
      let icon = null

      if (this.taskIsTracked()) {
        label = messages.untrackLabel
        icon = "bookmark-icon"
      }
      else {
        label = messages.trackLabel
        icon = "bookmark-add-icon"
      }

      control = (
        <button className="button icon-only" onClick={this.toggleSaved}>
          <span className="control-icon"
                title={this.props.intl.formatMessage(label)}>
            <SvgSymbol viewBox='0 0 20 20' sym={icon} />
          </span>
          <span className="control-label">
            <FormattedMessage {...label} />
          </span>
        </button>
      )
    }
    else {
      control = (
        <div className="field" onClick={this.toggleSaved}>
          <input type="checkbox" className="switch is-thin"
                 checked={this.taskIsTracked()} />
          <label>
            <FormattedMessage {...messages.trackLabel } />
          </label>
        </div>
      )
    }

    return (
      <div className={classNames("task-track-controls", this.props.className)}>
        {control}
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
