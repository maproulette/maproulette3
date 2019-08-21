import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _pick from 'lodash/pick'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import Button from '../../../../Button/Button'
import messages from './Messages'

/**
 * TaskFalsePositiveControl displays a control for marking a task with a
 * false-positive status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskFalsePositiveControl extends Component {
  handleKeyboardShortcuts = this.props.quickKeyHandler(
    this.props.keyboardShortcutGroups.taskCompletion.falsePositive.key,
    () => this.props.complete(TaskStatus.falsePositive)
  )

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
    if (this.props.asLink) {
      return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a onClick={() => this.props.complete(TaskStatus.falsePositive)}>
          {this.props.falsePositiveLabel ? this.props.falsePositiveLabel :
           <FormattedMessage {...messages.falsePositiveLabel} />
          }
        </a>
      )
    }

    return (
      <Button
        className="mr-button--blue-fill"
        title={this.props.intl.formatMessage(messages.falsePositiveTooltip)}
        onClick={() => this.props.complete(TaskStatus.falsePositive)}
      >
        {this.props.falsePositiveLabel ? this.props.falsePositiveLabel :
          <FormattedMessage {...messages.falsePositiveLabel} />
        }
      </Button>
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
