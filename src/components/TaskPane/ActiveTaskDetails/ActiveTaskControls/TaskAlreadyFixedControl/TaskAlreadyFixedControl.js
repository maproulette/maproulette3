import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _pick from 'lodash/pick'
import _isEmpty from 'lodash/isEmpty'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import Button from '../../../../Button/Button'
import messages from './Messages'

const shortcutGroup = 'taskCompletion'

/**
 * TaskAlreadyFixedControl displays the a control for marking a task with an
 * already-fixed status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskAlreadyFixedControl extends Component {
  completeTask = () => {
    // Ignore if shortcut group is not active
    if (_isEmpty(this.props.activeKeyboardShortcuts[shortcutGroup])) {
      return
    }

    this.props.complete(TaskStatus.alreadyFixed)
  }

  handleKeyboardShortcuts = this.props.quickKeyHandler(
    this.props.keyboardShortcutGroups.taskCompletion.alreadyFixed.key,
    () => this.completeTask()
  )

  componentDidMount() {
    this.props.activateKeyboardShortcut(
      shortcutGroup,
      _pick(this.props.keyboardShortcutGroups.taskCompletion, 'alreadyFixed'),
      this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcut(shortcutGroup, 'alreadyFixed',
                                          this.handleKeyboardShortcuts)
  }

  render() {
    if (this.props.asLink) {
      return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a onClick={() => this.props.complete(TaskStatus.alreadyFixed)}>
          <FormattedMessage {...messages.alreadyFixedLabel} />
        </a>
      )
    }
    else {
      return (
        <Button
          className="mr-button--blue-fill"
          onClick={() => this.props.complete(TaskStatus.alreadyFixed)}
        >
          <FormattedMessage {...messages.alreadyFixedLabel} />
        </Button>
      )
    }
  }
}

TaskAlreadyFixedControl.propTypes = {
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
}
