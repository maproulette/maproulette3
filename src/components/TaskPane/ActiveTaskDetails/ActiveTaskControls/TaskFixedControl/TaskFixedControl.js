import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _pick from 'lodash/pick'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import messages from './Messages'

/**
 * TaskFixedControl displays a control for marking a task with a fixed status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskFixedControl extends Component {
  handleKeyboardShortcuts = this.props.quickKeyHandler(
    this.props.keyboardShortcutGroups.taskCompletion.fixed.key,
    () => this.props.complete(TaskStatus.fixed)
  )

  componentDidMount() {
    this.props.activateKeyboardShortcut(
      'taskCompletion',
      _pick(this.props.keyboardShortcutGroups.taskCompletion, 'fixed'),
      this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcut('taskCompletion', 'fixed',
                                          this.handleKeyboardShortcuts)
  }

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
