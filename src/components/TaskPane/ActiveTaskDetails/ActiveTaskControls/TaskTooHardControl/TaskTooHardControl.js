import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import messages from './Messages'

/**
 * TaskTooHardControl displays a control for marking a task with a too-hard
 * status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskTooHardControl extends Component {
  render() {
    return (
      <button className={classNames("button large-and-wide full-width label-only too-hard-control",
                                    this.props.className)}
              onClick={() => this.props.complete(TaskStatus.tooHard)}>
        <FormattedMessage {...messages.tooHardLabel} />
      </button>
    )
  }
}

TaskTooHardControl.propTypes = {
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
}
