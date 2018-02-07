import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _isNumber from 'lodash/isNumber'
import _omit from 'lodash/omit'
import { allowedStatusProgressions,
         TaskStatus } from '../../../../services/Task/TaskStatus/TaskStatus'
import TaskCommentInput from './TaskCommentInput/TaskCommentInput'
import SignInButton from '../../../SignInButton/SignInButton'
import WithMapBounds from '../../../HOCs/WithMapBounds/WithMapBounds'
import WithKeyboardShortcuts from '../../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import TaskStatusIndicator from './TaskStatusIndicator/TaskStatusIndicator'
import TaskCompletionStep1 from './TaskCompletionStep1/TaskCompletionStep1'
import TaskCompletionStep2 from './TaskCompletionStep2/TaskCompletionStep2'
import TaskNextControl from './TaskNextControl/TaskNextControl'
import './ActiveTaskControls.css'

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

  cancelEditing = () => {
    this.setState({taskBeingCompleted: null})
    this.props.closeEditor()
  }

  /** Mark the task as complete with the given status */
  complete = taskStatus => {
    this.setState({taskBeingCompleted: this.props.task.id})
    this.props.completeTask(this.props.task.id, this.props.task.parent.id,
                            taskStatus, this.state.comment)
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

      const canProgress = allowedProgressions.size > 0

      const hasExistingStatus = _isNumber(this.props.task.status) &&
                                this.props.task.status !== TaskStatus.created

      return (
        <div className={classNames('active-task-controls', this.props.className,
                                  {'is-minimized': this.props.isMinimized})}>
          {hasExistingStatus &&
           <TaskStatusIndicator {...this.props} />
          }

          {canProgress &&
           <TaskCommentInput className="active-task-controls__task-comment"
                             value={this.state.comment}
                             commentChanged={this.setComment}
                             {..._omit(this.props, 'className')} />
          }

          {!isEditingTask &&
           <TaskCompletionStep1 allowedProgressions={allowedProgressions}
                                pickEditor={this.pickEditor}
                                complete={this.complete}
                                {...this.props} />
          }

          {!isEditingTask && hasExistingStatus &&
           <TaskNextControl {...this.props} />
          }

          {isEditingTask &&
           <TaskCompletionStep2 allowedProgressions={allowedProgressions}
                                complete={this.complete}
                                cancelEditing={this.cancelEditing}
                                {...this.props} />
          }
        </div>
      )
    }
  }
}

ActiveTaskControls.propTypes = {
  task: PropTypes.object,
  editor: PropTypes.object,
}

ActiveTaskControls.defaultProps = {
  editor: {},
}

export default WithMapBounds(
  WithKeyboardShortcuts(
    injectIntl(ActiveTaskControls)
  )
)
