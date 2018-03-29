import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _pick from 'lodash/pick'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * TaskFalsePositiveControl displays a control for marking a task with a
 * false-positive status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskFalsePositiveControl extends Component {
  handleKeyboardShortcuts = (event) => {
    if (this.props.textInputActive(event)) { // ignore typing in inputs
      return
    }

    const shortcuts = this.props.keyboardShortcutGroups.taskCompletion
    if (event.key === shortcuts.falsePositive.key) {
      this.props.complete(TaskStatus.falsePositive)
    }
  }

  componentDidMount() {
    this.props.activateKeyboardShortcut(
      'taskCompletion',
      _pick(this.props.keyboardShortcutGroups.taskCompletion, 'falsePositive'),
      this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcut('taskCompletion', 'falsePositive',
                                          this.handleKeyboardShortcuts)
  }

  render() {
    return (
      <button className={classNames("button false-positive-control",
                                    this.props.className,
                                    {"large-and-wide": !this.props.isMinimized,
                                    "icon-only": this.props.isMinimized})}
              title={this.props.intl.formatMessage(messages.falsePositiveTooltip)}
              onClick={() => this.props.complete(TaskStatus.falsePositive)}>
        <span className="control-icon">
          <SvgSymbol viewBox='0 0 20 20' sym="check-icon" />
        </span>
        <span className="control-label">
          <FormattedMessage {...messages.falsePositiveLabel} />
        </span>
      </button>
    )
  }
}

TaskFalsePositiveControl.propTypes = {
  /** Set to true to render in a minimized form */
  isMinimized: PropTypes.bool,
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
  /** Available keyboard shortcuts */
  keyboardShortcutGroups: PropTypes.object.isRequired,
  /** Invoked when keyboard shortcuts are to be active */
  activateKeyboardShortcut: PropTypes.func.isRequired,
  /** Invoked when keyboard shortcuts should no longer be active  */
  deactivateKeyboardShortcut: PropTypes.func.isRequired,
}

TaskFalsePositiveControl.defaultProps = {
  isMinimized: false,
}
