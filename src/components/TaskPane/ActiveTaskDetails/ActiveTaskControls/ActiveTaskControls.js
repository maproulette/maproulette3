import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _isUndefined from 'lodash/isUndefined'
import { allowedStatusProgressions, isCompletionStatus,
         isFinalStatus, messagesByStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus } from '../../../../services/Task/TaskReview/TaskReviewStatus'
import { TaskReviewLoadMethod } from '../../../../services/Task/TaskReview/TaskReviewLoadMethod'
import SignInButton from '../../../SignInButton/SignInButton'
import WithSearch from '../../../HOCs/WithSearch/WithSearch'
import WithTaskReview from '../../../HOCs/WithTaskReview/WithTaskReview'
import WithKeyboardShortcuts
       from '../../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import TaskCompletionStep1 from './TaskCompletionStep1/TaskCompletionStep1'
import TaskCompletionStep2 from './TaskCompletionStep2/TaskCompletionStep2'
import TaskNextControl from './TaskNextControl/TaskNextControl'
import TaskConfirmationModal
       from '../../../TaskConfirmationModal/TaskConfirmationModal'
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
    confirmingTask: null,
    confirmingStatus: null,
    comment: "",
    revisionLoadBy: TaskReviewLoadMethod.all,
  }

  setComment = comment => this.setState({comment})

  toggleNeedsReview = () => {
    this.setState({needsReview: !this.getNeedsReviewSetting()})
  }

  getNeedsReviewSetting = () => {
    // We always need review if we are revising this task after it was rejected.
    if (this.props.task.reviewStatus === TaskReviewStatus.rejected) {
      return true
    }

    return !_isUndefined(this.state.needsReview) ? this.state.needsReview :
      _get(this.props, 'user.settings.needsReview')
  }

  /** Choose which editor to launch for fixing a task */
  pickEditor = ({ value }) => {
    this.setState({taskBeingCompleted: this.props.task.id})
    this.props.editTask(value, this.props.task, this.props.mapBounds)
  }

  chooseLoadBy = loadMethod => {
    const isVirtual = _isFinite(this.props.virtualChallengeId)
    const challengeId = isVirtual ? this.props.virtualChallengeId :
                                    this.props.challengeId
    this.props.setTaskLoadBy(challengeId, isVirtual, loadMethod)
  }

  chooseRevisionLoadBy = loadMethod => {
    this.setState({revisionLoadBy: loadMethod})
  }

  /** Indicate the editor has been closed without completing the task */
  cancelEditing = () => {
    this.setState({taskBeingCompleted: null})
    this.props.closeEditor()
  }

  /** Mark the task as complete with the given status */
  complete = taskStatus => {
    const revisionSubmission = this.props.task.reviewStatus === TaskReviewStatus.rejected

    if (!_isUndefined(this.state.submitRevision)) {
      this.props.updateTaskReviewStatus(this.props.task, this.state.submitRevision,
                                        this.state.comment, this.state.revisionLoadBy,
                                        this.props.history)
    }
    else {
      this.props.completeTask(this.props.task.id, this.props.task.parent.id,
                              taskStatus, this.state.comment,
                              revisionSubmission? null : this.props.taskLoadBy,
                              this.props.user.id,
                              revisionSubmission || this.state.needsReview)
      if (revisionSubmission) {
        if (this.state.revisionLoadBy === TaskReviewLoadMethod.inbox) {
          this.props.history.push('/inbox')
        }
        else {
          this.props.history.push('/review')
        }
      }
    }
  }

  initiateCompletion = (taskStatus, submitRevision) => {
    this.setState({
      confirmingTask: this.props.task,
      confirmingStatus: taskStatus,
      submitRevision,
    })
  }

  confirmCompletion = () => {
    this.complete(this.state.confirmingStatus)
    this.resetConfirmation()
  }

  resetConfirmation = () => {
    this.setState({confirmingTask: null, confirmingStatus: null, comment: ""})
  }

  /** Move to the next task without modifying the task status */
  next = (challengeId, taskId) => {
    this.props.nextTask(challengeId, taskId, this.props.taskLoadBy, this.state.comment)
  }

  componentDidUpdate(nextProps) {
    // Let's set default revisionLoadBy to inbox if we are coming from inbox
    if (_get(this.props.history, 'location.state.fromInbox') &&
        this.state.revisionLoadBy !== TaskReviewLoadMethod.inbox) {
      this.setState({revisionLoadBy: TaskReviewLoadMethod.inbox})
    }
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

    const needsRevised = this.props.task.reviewStatus === TaskReviewStatus.rejected

    const isEditingTask =
      _get(this.props, 'editor.taskId') === this.props.task.id &&
      _get(this.props, 'editor.success') === true

    const editorLoading =
      _get(this.props, 'editor.taskId') !== this.props.task.id &&
           this.state.taskBeingCompleted === this.props.task.id

    const fromInbox = _get(this.props.history, 'location.state.fromInbox')

    if (editorLoading) {
      return <BusySpinner />
    }
    else {
      const allowedProgressions =
        allowedStatusProgressions(this.props.task.status)
      const isComplete = isCompletionStatus(this.props.task.status)
      const isFinal = isFinalStatus(this.props.task.status)

      return (
        <div className={this.props.className}>
          {!isEditingTask && isComplete &&
           <div className="mr-text-white mr-text-md mr-my-4">
             <FormattedMessage
               {...messages.markedAs}
             /> <FormattedMessage
               {...messagesByStatus[this.props.task.status]}
             />
           </div>
          }

          {!isEditingTask && (!isFinal || needsRevised) &&
           <TaskCompletionStep1
             {...this.props}
             allowedProgressions={allowedProgressions}
             pickEditor={this.pickEditor}
             complete={this.initiateCompletion}
             nextTask={this.next}
             needsRevised={needsRevised}
           />
          }

          {isEditingTask && !needsRevised &&
           <TaskCompletionStep2
             {...this.props}
             allowedProgressions={allowedProgressions}
             complete={this.initiateCompletion}
             cancelEditing={this.cancelEditing}
           />
          }

          {!isEditingTask && isComplete && !needsRevised &&
           <TaskNextControl
             {...this.props}
             className="mr-mt-1"
             nextTask={this.next}
           />
          }

          {this.state.confirmingTask &&
            <TaskConfirmationModal
              {...this.props}
              task={this.state.taskBeingComfirmed}
              status={this.state.confirmingStatus}
              comment={this.state.comment}
              setComment={this.setComment}
              needsReview={this.getNeedsReviewSetting()}
              toggleNeedsReview={this.toggleNeedsReview}
              loadBy={needsRevised ? this.state.revisionLoadBy : this.props.taskLoadBy}
              chooseLoadBy={(load) => needsRevised ? this.chooseRevisionLoadBy(load) :
                                                 this.chooseLoadBy(load)}
              onConfirm={this.confirmCompletion}
              onCancel={this.resetConfirmation}
              needsRevised={this.state.submitRevision}
              fromInbox={fromInbox}
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
  WithTaskReview(
    WithKeyboardShortcuts(
      injectIntl(ActiveTaskControls)
    )),
  'task'
)
