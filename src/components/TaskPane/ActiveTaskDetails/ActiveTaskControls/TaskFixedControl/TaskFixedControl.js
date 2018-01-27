import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import messages from './Messages'

/**
 * TaskFixedControl displays a control for marking a task with a fixed status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskFixedControl extends Component {
  render() {
    return (
      <button className={classNames("button large-and-wide full-width label-only fixed-control",
                                    this.props.className)}
              onClick={() => this.props.complete(TaskStatus.fixed)}>
        <FormattedMessage {...messages.fixedLabel} />
      </button>
    )
  }
}

TaskFixedControl.propTypes = {
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
}
