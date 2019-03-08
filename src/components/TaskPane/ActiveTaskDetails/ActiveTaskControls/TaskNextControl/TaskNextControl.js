import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import messages from './Messages'

/**
 * TaskNextControl displays a control for loading a new task without altering
 * the status of the current task. It's intended to be displayed for tasks that
 * have already been given a status, offering the user a chance to move on to
 * another task.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskNextControl extends Component {
  render() {
    return (
      <button
        className={classNames("mr-button mr-button--white mr-w-full", this.props.className)}
        onClick={() => this.props.nextTask(this.props.task.parent.id, this.props.task.id)}
        title={this.props.intl.formatMessage(messages.nextTooltip)}
      >
        <FormattedMessage {...messages.nextLabel} />
      </button>
    )
  }
}

TaskNextControl.propTypes = {
  /** The current active task */
  task: PropTypes.object.isRequired,
  /** Invoked if the user desires to load a new task */
  nextTask: PropTypes.func.isRequired,
}
