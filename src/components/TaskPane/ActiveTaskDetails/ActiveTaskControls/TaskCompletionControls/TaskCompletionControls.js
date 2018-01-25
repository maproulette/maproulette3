import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { omit as _omit } from 'lodash'
import { FormattedMessage } from 'react-intl'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import TaskCommentInput from '../TaskCommentInput/TaskCommentInput'
import messages from './Messages'
import './TaskCompletionControls.css'

/**
 * TaskCompletionControls presents controls for finishing up completion of a
 * task after an editor has been opened. It allows the user to mark that they
 * fixed the task, the task was too hard, it was already fixed by someone else,
 * etc. The user can also cancel and abort completion of the task.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskCompletionControls extends Component {
  complete = (taskStatus) => {
    this.props.setTaskBeingCompleted(this.props.task.id)
    this.props.completeTask(this.props.task.id, this.props.task.parent.id,
                            taskStatus, this.props.comment)
    this.props.closeEditor()
  }

  cancel = () => {
    this.props.setTaskBeingCompleted(null)
    this.props.closeEditor()
  }

  handleKeyboardShortcuts = (event) => {
    const completionShortcuts = this.props.keyboardShortcutGroups.taskCompletion

    switch(event.key) {
      case completionShortcuts.cancel.key:
        this.cancel()
        break
      default:
    }
  }

  componentDidMount() {
    this.props.activateKeyboardShortcuts(this.props.keyboardShortcutGroups.taskCompletion,
                                         this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcuts(this.props.keyboardShortcutGroups.taskCompletion,
                                           this.handleKeyboardShortcuts)
  }

  render() {
    return (
      <div className={classNames('task-completion-controls', this.props.className)}>
        <TaskCommentInput className="task-completion-controls__task-comment"
                          value={this.props.comment}
                          commentChanged={this.props.setComment}
                          {..._omit(this.props, 'className')} />

        <button className="button task-completion-controls__fix"
                onClick={() => this.complete(TaskStatus.fixed)}>
          <FormattedMessage {...messages.fixed} />
        </button>

        <button className="button task-completion-controls__too-hard"
                onClick={() => this.complete(TaskStatus.tooHard)}>
          <FormattedMessage {...messages.notFixed} />
        </button>

        <button className="button task-completion-controls__already-fixed"
                onClick={() => this.complete(TaskStatus.alreadyFixed)}>
          <FormattedMessage {...messages.alreadyFixed} />
        </button>

        <div className="has-centered-children">
          <a className="is-text task-completion-controls__cancel" onClick={this.cancel}>
            <SvgSymbol viewBox='0 0 20 20' sym="back-icon" />
            <FormattedMessage {...messages.cancelEditing} />
          </a>
        </div>
      </div>
    )
  }
}

TaskCompletionControls.propTypes = {
  /** The task being completed */
  task: PropTypes.object.isRequired,
  /** The current completion comment */
  comment: PropTypes.string,
  /** Invoked when the user indicates a completion status */
  completeTask: PropTypes.func.isRequired,
  /** Invoked to cancel completion of the current task */
  setTaskBeingCompleted: PropTypes.func.isRequired,
  /** Invoked to set a completion comment */
  setComment: PropTypes.func.isRequired,
  /** Invoked if the user cancels and the editor is to be closed */
  closeEditor: PropTypes.func.isRequired,
  /** The keyboard shortcuts to be offered on this step */
  keyboardShortcutGroups: PropTypes.object.isRequired,
  /** Invoked when keyboard shortcuts are to be active */
  activateKeyboardShortcuts: PropTypes.func.isRequired,
  /** Invoked when keyboard shortcuts should no longer be active  */
  deactivateKeyboardShortcuts: PropTypes.func.isRequired,
}

TaskCompletionControls.defaultProps = {
  comment: "",
}
