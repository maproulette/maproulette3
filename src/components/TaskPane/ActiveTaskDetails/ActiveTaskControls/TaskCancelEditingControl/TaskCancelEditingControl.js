import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { pick as _pick } from 'lodash'
import classNames from 'classnames'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './TaskCancelEditingControl.css'

/**
 * TaskCancelEditingControl displays a control for cancelling the current
 * task-editing session.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskCancelEditingControl extends Component {
  handleKeyboardShortcuts = (event) => {
    // Ignore typing in inputs.
    if (event.target.nodeName.toLowerCase() === 'input') {
      return
    }

    const shortcuts = this.props.keyboardShortcutGroups.taskEditing
    if (event.key === shortcuts.cancel.key) {
      this.props.cancelEditing()
    }
  }

  componentDidMount() {
    this.props.activateKeyboardShortcut(
      'taskEditing',
      _pick(this.props.keyboardShortcutGroups.taskEditing, 'cancel'),
      this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcut('taskEditing', 'cancel',
                                          this.handleKeyboardShortcuts)
  }

  render() {
    return (
      <div className="has-centered-children">
        <button className={classNames("button is-green is-outlined cancel-control",
                                      this.props.className)}
                onClick={this.props.cancelEditing}
                title={this.props.intl.formatMessage(messages.cancelEditingTooltip)}>
          <SvgSymbol viewBox='0 0 20 20' sym="back-icon" />
          <FormattedMessage {...messages.cancelEditingLabel} />
        </button>
      </div>
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
