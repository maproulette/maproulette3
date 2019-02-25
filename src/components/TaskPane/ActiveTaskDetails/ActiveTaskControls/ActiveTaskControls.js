import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import _get from 'lodash/get'
import { allowedStatusProgressions, isCompletionStatus, messagesByStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import TaskCommentInput from '../../../TaskCommentInput/TaskCommentInput'
import SignInButton from '../../../SignInButton/SignInButton'
import WithSearch from '../../../HOCs/WithSearch/WithSearch'
import WithKeyboardShortcuts
       from '../../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import TaskCompletionStep1 from './TaskCompletionStep1/TaskCompletionStep1'
import TaskCompletionStep2 from './TaskCompletionStep2/TaskCompletionStep2'
import TaskNextControl from './TaskNextControl/TaskNextControl'
import messages from './Messages'
import './ActiveTaskControls.scss'

/**
 * ActiveTaskControls renders the appropriate controls for the given
 * active task based on the state of the task and editing workflow.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ActiveTaskControls extends Component {
  state = {
    taskBeingCompleted: null,
    comment: "",
  }

  setComment = comment => this.setState({comment})

  /** Choose which editor to launch for fixing a task */
  pickEditor = ({ value }) => {
    this.setState({taskBeingCompleted: this.props.task.id})
    this.props.editTask(value, this.props.task, this.props.mapBounds)
  }

  /** Indicate the editor has been closed without completing the task */
  cancelEditing = () => {
    this.setState({taskBeingCompleted: null})
    this.props.closeEditor()
  }

  /** Mark the task as complete with the given status */
  complete = taskStatus => {
    this.setState({taskBeingCompleted: this.props.task.id})
    this.props.completeTask(this.props.task.id, this.props.task.parent.id,
                            taskStatus, this.state.comment, this.props.taskLoadBy,
                            this.props.user.id)
  }

  /** Move to the next task without modifying the task status */
  next = (challengeId, taskId) => {
    this.props.nextTask(challengeId, taskId, this.props.taskLoadBy, this.state.comment)
  }

  render() {
    // If the user is not logged in, show a sign-in button instead of controls.
    if (!_get(this.props, 'user.isLoggedIn')) {
      return (
        <div className={classNames('active-task-controls',
                                   {'is-minimized': this.props.isMinimized})}>
          <div className="has-centered-children">
            <SignInButton className="active-task-controls--signin" {...this.props} />
          </div>
        </div>
      )
    }
    else if (!this.props.task) {
      return null
    }

    const isEditingTask =
      _get(this.props, 'editor.taskId') === this.props.task.id &&
      _get(this.props, 'editor.success') === true

    const editorLoading =
      _get(this.props, 'editor.taskId') !== this.props.task.id &&
           this.state.taskBeingCompleted === this.props.task.id

    if (editorLoading) {
      return <BusySpinner />
    }
    else {
      const allowedProgressions =
        allowedStatusProgressions(this.props.task.status)
      const isComplete = isCompletionStatus(this.props.task.status)

      return (
        <div className={this.props.className}>
          <TaskCommentInput
            {...this.props}
            className="mr-border-yellow-75"
            value={this.state.comment}
            commentChanged={this.setComment}
          />

          {!isEditingTask && !isComplete &&
           <TaskCompletionStep1
             {...this.props}
             allowedProgressions={allowedProgressions}
             pickEditor={this.pickEditor}
             complete={this.complete}
             nextTask={this.next}
           />
          }

          {(!isEditingTask && isComplete) &&
           <div className="mr-text-white mr-text-md mr-mt-4">
             <div className="mr-mb-2">
               <FormattedMessage
                 {...messages.markedAs}
               /> <FormattedMessage
                 {...messagesByStatus[this.props.task.status]}
               />
             </div>
             <TaskNextControl {...this.props} nextTask={this.next} />
           </div>
          }

          {isEditingTask &&
           <TaskCompletionStep2
             {...this.props} 
             allowedProgressions={allowedProgressions}
             complete={this.complete}
             cancelEditing={this.cancelEditing}
           />
          }
        </div>
      )
    }
  }
}

ActiveTaskControls.propTypes = {
  /** Current task controls are to operate upon */
  task: PropTypes.object,
  /** Current editor status */
  editor: PropTypes.object,
  /** Current setting of whether to load tasks randomly or by proximity */
  taskLoadBy: PropTypes.string,
}

ActiveTaskControls.defaultProps = {
  editor: {},
}

export default WithSearch(
  WithKeyboardShortcuts(
    injectIntl(ActiveTaskControls)
  ),
  'task'
)
