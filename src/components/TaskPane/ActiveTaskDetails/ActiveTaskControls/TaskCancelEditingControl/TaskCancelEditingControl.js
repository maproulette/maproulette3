import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _pick from 'lodash/pick'
import _isEmpty from 'lodash/isEmpty'
import classNames from 'classnames'
import messages from './Messages'
import './TaskCancelEditingControl.scss'

const shortcutGroup = 'taskEditing'

/**
 * TaskCancelEditingControl displays a control for cancelling the current
 * task-editing session.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskCancelEditingControl extends Component {
  handleKeyboardShortcuts = (event) => {
    // Ignore if shortcut group is not active
    if (_isEmpty(this.props.activeKeyboardShortcuts[shortcutGroup])) {
      return
    }

    if (this.props.textInputActive(event)) { // ignore typing in inputs
      return
    }

    const shortcuts = this.props.keyboardShortcutGroups.taskEditing
    if (event.key === shortcuts.cancel.key) {
      this.props.cancelEditing()
    }
  }

  componentDidMount() {
    this.props.activateKeyboardShortcut(
      shortcutGroup,
      _pick(this.props.keyboardShortcutGroups.taskEditing, 'cancel'),
      this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcut(shortcutGroup, 'cancel',
                                          this.handleKeyboardShortcuts)
  }

  render() {
    return (
      <button
        className={classNames("mr-button mr-button--white mr-w-full", this.props.className)}
        onClick={this.props.cancelEditing}
      >
        <FormattedMessage {...messages.cancelEditingLabel} />
      </button>
    )
  }
}

TaskCancelEditingControl.propTypes = {
  /** Invoked to cancel the editing session */
  cancelEditing: PropTypes.func.isRequired,
  /** Available keyboard shortcuts */
  keyboardShortcutGroups: PropTypes.object.isRequired,
  /** Invoked when keyboard shortcuts are to be active */
  activateKeyboardShortcut: PropTypes.func.isRequired,
  /** Invoked when keyboard shortcuts should no longer be active  */
  deactivateKeyboardShortcut: PropTypes.func.isRequired,
}
