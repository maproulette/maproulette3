import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _pick from 'lodash/pick'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import messages from './Messages'

/**
 * TaskAlreadyFixedControl displays the a control for marking a task with an
 * already-fixed status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskAlreadyFixedControl extends Component {
  handleKeyboardShortcuts = this.props.quickKeyHandler(
    this.props.keyboardShortcutGroups.taskCompletion.alreadyFixed.key,
    () => this.props.complete(TaskStatus.alreadyFixed)
  )

  componentDidMount() {
    this.props.activateKeyboardShortcut(
      'taskCompletion',
      _pick(this.props.keyboardShortcutGroups.taskCompletion, 'alreadyFixed'),
      this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcut('taskCompletion', 'alreadyFixed',
                                          this.handleKeyboardShortcuts)
  }

  render() {
    return (
      <button className={classNames("button large-and-wide full-width label-only already-fixed-control",
                                    this.props.className)}
              onClick={() => this.props.complete(TaskStatus.alreadyFixed)}>
        <FormattedMessage {...messages.alreadyFixedLabel} />
      </button>
    )
  }
}

TaskAlreadyFixedControl.propTypes = {
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
}
