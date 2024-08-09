import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import Button from '../../../../Button/Button'
import messages from './Messages'

/**
 * TaskSkipControl displays a control for marking a task with a skipped status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskSkipControl extends Component {
  render() {
    if (this.props.asLink) {
      return (
        <a onClick={() => this.props.complete(TaskStatus.skipped)}>
          <FormattedMessage {...messages.skipLabel} />
        </a>
      )
    }

    return (
      <Button
        className="mr-button--blue-fill mr-mb-2 mr-mr-2"
        style={{ minWidth: '10rem'}}
        onClick={() => this.props.complete(TaskStatus.skipped)}
      >
        <FormattedMessage {...messages.skipLabel} />
      </Button>
    )
  }
}

TaskSkipControl.propTypes = {
  /** Set to true to render in a minimized form */
  isMinimized: PropTypes.bool,
  /** Set to true to suppress display of control icon */
  suppressIcon: PropTypes.bool,
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
  suppressIcon: false,
}
