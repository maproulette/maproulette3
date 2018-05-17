import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import { allowedStatusProgressions,
         isFinalStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import TaskCommentInput from './TaskCommentInput/TaskCommentInput'
import TaskTrackControls from '../../TaskTrackControls/TaskTrackControls'
import TaskRandomnessControl
       from '../../TaskRandomnessControl/TaskRandomnessControl'
import MoreOptionsControl
       from './MoreOptionsControl/MoreOptionsControl'
import TaskManageControls from '../../TaskManageControls/TaskManageControls'
import SignInButton from '../../../SignInButton/SignInButton'
import WithMapBounds from '../../../HOCs/WithMapBounds/WithMapBounds'
import WithDeactivateOnOutsideClick from
       '../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import WithKeyboardShortcuts
       from '../../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import KeyboardShortcutReference
       from '../KeyboardShortcutReference/KeyboardShortcutReference'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import TaskCompletionStep1 from './TaskCompletionStep1/TaskCompletionStep1'
import TaskCompletionStep2 from './TaskCompletionStep2/TaskCompletionStep2'
import TaskNextControl from './TaskNextControl/TaskNextControl'
import './ActiveTaskControls.css'

const KeyboardReferencePopout =
  WithKeyboardShortcuts(WithDeactivateOnOutsideClick(KeyboardShortcutReference))

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
    this.props.editTask(value, this.props.task, this.props.mapBounds.task)
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
                            taskStatus, this.state.comment, this.props.taskLoadBy)
  }

  /** Move to the next task without modifying the task status */
  next = (challengeId, taskId) => {
    this.props.nextTask(challengeId, taskId, this.props.taskLoadBy, this.state.comment)
  }

  render() {
    // If the user is not logged in, show a sign-in button instead of controls.
    if (!_get(this.props, 'user.isLoggedIn')) {
      return (
        <div className={classNames('active-task-controls', this.props.className,
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

      return (
        <div className={classNames('active-task-controls', this.props.className,
                                  {'is-minimized': this.props.isMinimized})}>

          <TaskCommentInput className="active-task-controls__task-comment"
                            value={this.state.comment}
                            commentChanged={this.setComment}
                            {..._omit(this.props, 'className')} />

          {!isEditingTask &&
           <TaskCompletionStep1 allowedProgressions={allowedProgressions}
                                pickEditor={this.pickEditor}
                                complete={this.complete}
                                nextTask={this.next}
                                {..._omit(this.props, 'nextTask')} />
          }

          {(!isEditingTask && isFinalStatus(this.props.task.status)) &&
           <TaskNextControl nextTask={this.next}
                            {..._omit(this.props, 'nextTask')} />
          }

          {isEditingTask &&
           <TaskCompletionStep2 allowedProgressions={allowedProgressions}
                                complete={this.complete}
                                cancelEditing={this.cancelEditing}
                                {...this.props} />
          }

          <MoreOptionsControl className="active-task-controls__additional-controls"
                              {..._omit(this.props, 'className')} >
            <TaskTrackControls className="active-task-controls__track-task"
                              {..._omit(this.props, ['className', 'isMinimized'])} />
            <TaskRandomnessControl {..._omit(this.props, ['className', 'isMinimized'])} />
            {!this.props.isMinimized &&
             <KeyboardReferencePopout {..._omit(this.props, ['className'])} />
            }

            <TaskManageControls {...this.props} />
          </MoreOptionsControl>
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

export default WithMapBounds(
  WithKeyboardShortcuts(
    injectIntl(ActiveTaskControls)
  )
)
