import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import { pick as _pick } from 'lodash'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * TaskSkipControl displays a control for marking a task with a skipped status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskSkipControl extends Component {
  handleKeyboardShortcuts = (event) => {
    // Ignore typing in inputs.
    if (event.target.nodeName.toLowerCase() === 'input') {
      return
    }

    const shortcuts = this.props.keyboardShortcutGroups.taskCompletion
    if (event.key === shortcuts.skip.key) {
      this.props.complete(TaskStatus.skipped)
    }
  }

  componentDidMount() {
    this.props.activateKeyboardShortcut(
      'taskCompletion',
      _pick(this.props.keyboardShortcutGroups.taskCompletion, 'skip'),
      this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcut('taskCompletion', 'skip',
                                          this.handleKeyboardShortcuts)
  }

  render() {
    return (
      <button className={classNames("button skip-control",
                                    this.props.className,
                                    {"large-and-wide": !this.props.isMinimized,
                                    "icon-only": this.props.isMinimized})}
              onClick={() => this.props.complete(TaskStatus.skipped)}>
        <span className="control-icon"
              title={this.props.intl.formatMessage(messages.skipTooltip)}>
          <SvgSymbol viewBox='0 0 20 20' sym="skip-icon" />
        </span>
        <span className="control-label">
          <FormattedMessage {...messages.skipLabel} />
        </span>
      </button>
    )
  }
}

TaskSkipControl.propTypes = {
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

TaskSkipControl.defaultProps = {
  isMinimized: false,
}
