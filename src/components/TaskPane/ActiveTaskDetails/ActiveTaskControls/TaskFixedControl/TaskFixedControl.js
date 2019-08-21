import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _pick from 'lodash/pick'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import Button from '../../../../Button/Button'
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
    if (this.props.asLink) {
      return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a onClick={() => this.props.complete(TaskStatus.fixed)}>
          {this.props.fixedLabel ? this.props.fixedLabel :
           <FormattedMessage {...messages.fixedLabel} />
          }
        </a>
      )
    }
    else {
      return (
        <Button
          className="mr-button--blue-fill"
          onClick={() => this.props.complete(TaskStatus.fixed)}
        >
          {this.props.fixedLabel ? this.props.fixedLabel :
           <FormattedMessage {...messages.fixedLabel} />
          }
        </Button>
      )
    }
  }
}

TaskFixedControl.propTypes = {
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
}
