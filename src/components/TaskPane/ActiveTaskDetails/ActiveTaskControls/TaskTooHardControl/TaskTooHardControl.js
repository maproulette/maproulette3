import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _pick from 'lodash/pick'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import Button from '../../../../Button/Button'
import messages from './Messages'

/**
 * TaskTooHardControl displays a control for marking a task with a too-hard
 * status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskTooHardControl extends Component {
  handleKeyboardShortcuts = this.props.quickKeyHandler(
    this.props.keyboardShortcutGroups.taskCompletion.tooHard.key,
    () => this.props.complete(TaskStatus.tooHard)
  )

  componentDidMount() {
    this.props.activateKeyboardShortcut(
      'taskCompletion',
      _pick(this.props.keyboardShortcutGroups.taskCompletion, 'tooHard'),
      this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcut('taskCompletion', 'tooHard',
                                          this.handleKeyboardShortcuts)
  }
  render() {
    return (
      <Button
        className="mr-button--blue-fill"
        onClick={() => this.props.complete(TaskStatus.tooHard)}
      >
        <FormattedMessage {...messages.tooHardLabel} />
      </Button>
    )
  }
}

TaskTooHardControl.propTypes = {
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
}
