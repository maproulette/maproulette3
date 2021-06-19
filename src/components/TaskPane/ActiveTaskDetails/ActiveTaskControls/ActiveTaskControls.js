import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isEmpty from 'lodash/isEmpty'
import _remove from 'lodash/remove'
import _cloneDeep from 'lodash/cloneDeep'
import _isObject from 'lodash/isObject'
import _isFinite from 'lodash/isFinite'
import _isUndefined from 'lodash/isUndefined'
import { allowedStatusProgressions, isCompletionStatus,
         isFinalStatus, messagesByStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus } from '../../../../services/Task/TaskReview/TaskReviewStatus'
import { TaskReviewLoadMethod } from '../../../../services/Task/TaskReview/TaskReviewLoadMethod'
import { Editor } from '../../../../services/Editor/Editor'
import { OPEN_STREET_MAP } from '../../../../services/VisibleLayer/LayerSources'
import AsCooperativeWork from '../../../../interactions/Task/AsCooperativeWork'
import SignInButton from '../../../SignInButton/SignInButton'
import WithSearch from '../../../HOCs/WithSearch/WithSearch'
import WithChallengePreferences
       from '../../../HOCs/WithChallengePreferences/WithChallengePreferences'
import WithVisibleLayer from '../../../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithTaskReview from '../../../HOCs/WithTaskReview/WithTaskReview'
import WithTaskTags from '../../../HOCs/WithTaskTags/WithTaskTags'
import WithKeyboardShortcuts
       from '../../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import TaskCompletionStep1 from './TaskCompletionStep1/TaskCompletionStep1'
import TaskCompletionStep2 from './TaskCompletionStep2/TaskCompletionStep2'
import CooperativeWorkControls from './CooperativeWorkControls/CooperativeWorkControls'
import TaskNextControl from './TaskNextControl/TaskNextControl'
import TaskConfirmationModal
       from '../../../TaskConfirmationModal/TaskConfirmationModal'
import TaskTags from '../../../TaskTags/TaskTags'
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
    osmComment: "",
    comment: "",
    tags: null,
    revisionLoadBy: TaskReviewLoadMethod.all,
    doneLoadByFromHistory: false,
  }

  setComment = comment => this.setState({comment})
  setOSMComment = osmComment => this.setState({osmComment})
  setTags = tags => this.setState({tags})

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

  allowedEditors = () => {
    // Only JOSM allowed for change-file cooperative tasks
    return AsCooperativeWork(this.props.task).isChangeFileType() ?
      [Editor.josmLayer, Editor.josm] :
      null
  }

  /** Choose which editor to launch for fixing a task */
  pickEditor = ({ value }) => {
    const allowed = this.allowedEditors()
    // If the given editor isn't allowed, default to first allowed editor
    if (allowed && allowed.indexOf(value) === -1) {
      value = allowed[0]
    }

    this.setState({taskBeingCompleted: this.props.task.id})
    this.props.editTask(
      value,
      this.props.task,
      this.props.mapBounds,
      {
        imagery: this.props.source.id !== OPEN_STREET_MAP ? this.props.source : undefined,
        photoOverlay: this.props.showMapillaryLayer ? 'mapillary' : null,
      },
      this.props.taskBundle
    )
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

  chooseNextTask = (challengeId, isVirtual, taskId) => {
    this.setState({requestedNextTask: taskId})
  }

  clearNextTask = () => {
    this.setState({requestedNextTask: null})
  }

  /** Indicate the editor has been closed without completing the task */
  cancelEditing = () => {
    this.setState({taskBeingCompleted: null, requestedNextTask: null})
    this.props.closeEditor()
  }

  /** Mark the task as complete with the given status */
  complete = taskStatus => {
    const revisionSubmission = this.props.task.reviewStatus === TaskReviewStatus.rejected

    if (!_isUndefined(this.state.submitRevision)) {
      this.props.updateTaskReviewStatus(this.props.task, this.state.submitRevision,
                                        this.state.comment, this.state.tags,
                                        this.state.revisionLoadBy, this.props.history,
                                        this.props.taskBundle, this.state.requestedNextTask,
                                        taskStatus)
    }
    else {
      this.props.completeTask(this.props.task, this.props.task.parent.id,
                              taskStatus, this.state.comment, this.state.tags,
                              revisionSubmission ? null : this.props.taskLoadBy,
                              this.props.user.id,
                              revisionSubmission || this.state.needsReview,
                              this.state.requestedNextTask,
                              this.state.osmComment,
                              this.props.tagEdits,
                              this.props.taskBundle)
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
      osmComment: this.props.task.parent.checkinComment,
      confirmingStatus: taskStatus,
      submitRevision,
    })
  }

  confirmCompletion = () => {
    this.complete(this.state.confirmingStatus)
    this.resetConfirmation()
  }

  resetConfirmation = () => {
    this.setState({
      confirmingTask: null,
      confirmingStatus: null,
      requestedNextTask: null,
      comment: "", tags: null,
      doneLoadByFromHistory: false
    })
  }

  /** Move to the next task without modifying the task status */
  next = (challengeId, taskId) => {
    this.props.nextTask(challengeId, taskId, this.props.taskLoadBy, this.state.comment,
                        this.state.requestedNextTask)
  }

  componentDidUpdate(prevProps, prevState) {
    if (_get(this.props, 'task.id') !== _get(prevProps, 'task.id')) {
      return this.resetConfirmation()
    }

    if (this.state.tags === null && _get(this.props, 'task.tags')) {
      const unfilteredTags = _cloneDeep(this.props.task.tags)
      _remove(unfilteredTags, t => {
        if (_isEmpty(t)) {
          return true
        }
        else if (_isObject(t)) {
          return _isEmpty(t.name)
        }
      })
      const tags = _map(unfilteredTags, tag => (tag.name ? tag.name : tag)).join(', ')

      return this.setState({tags: tags})
    }

    // Let's set default revisionLoadBy to inbox if we are coming from inbox
    // and not changing revisionLoadBy state
    if (_get(this.props.history, 'location.state.fromInbox') &&
        this.state.revisionLoadBy !== TaskReviewLoadMethod.inbox &&
        !this.state.doneLoadByFromHistory) {
      return this.setState({revisionLoadBy: TaskReviewLoadMethod.inbox,
                            doneLoadByFromHistory: true})
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
        allowedStatusProgressions(this.props.task.status, false, needsRevised)
      const isComplete = isCompletionStatus(this.props.task.status)
      const isFinal = isFinalStatus(this.props.task.status)

      return (
        <div>
          {!isEditingTask && isComplete &&
           <div className="mr-text-white mr-text-md mr-my-4 mr-links-green-lighter">
             <div className="mr-flex mr-justify-between mr-items-center">
               <span>
                 <FormattedMessage
                   {...messages.markedAs}
                 /> <FormattedMessage
                   {...messagesByStatus[this.props.task.status]}
                 />
               </span>
               {this.props.task.changesetId > 0 &&
                <a
                  href={`${process.env.REACT_APP_OSM_API_SERVER}/changeset/${this.props.task.changesetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-text-base"
                >
                  <FormattedMessage {...messages.viewChangesetLabel} />
                </a>
               }
             </div>
             {(this.props.task.reviewStatus === TaskReviewStatus.needed ||
               this.props.task.reviewStatus === TaskReviewStatus.disputed) &&
                <div className="mr-text-yellow mr-text-sd mr-my-4">
                  <FormattedMessage {...messages.awaitingReview} />
                </div>
             }
           </div>
          }

          <TaskTags
            task={this.props.task}
            tags={this.state.tags}
            setTags={this.setTags}
            onConfirm={this.confirmCompletion}
            saveTaskTags={this.props.saveTaskTags}
            taskReadOnly={this.props.taskReadOnly}
          />

          {this.props.taskReadOnly ?
           <div className="mr-mt-4 mr-text-lg mr-text-pink-light">
            <FormattedMessage {...messages.readOnly} />
           </div> :
           <React.Fragment>
             {AsCooperativeWork(this.props.task).isTagType() && (!isFinal || needsRevised) &&
               <CooperativeWorkControls
                 {...this.props}
                 allowedProgressions={allowedProgressions}
                 pickEditor={this.pickEditor}
                 complete={this.initiateCompletion}
                 nextTask={this.next}
                 needsRevised={needsRevised}
               />
             }
             {!AsCooperativeWork(this.props.task).isTagType() && !isEditingTask && (!isFinal || needsRevised) &&
             <TaskCompletionStep1
               {...this.props}
               allowedEditors={this.allowedEditors()}
               allowedProgressions={allowedProgressions}
               pickEditor={this.pickEditor}
               complete={this.initiateCompletion}
               nextTask={this.next}
               needsRevised={needsRevised}
             />
             }

             {isEditingTask && !AsCooperativeWork(this.props.task).isTagType() &&
              <TaskCompletionStep2
                {...this.props}
                allowedProgressions={allowedProgressions}
                complete={this.initiateCompletion}
                cancelEditing={this.cancelEditing}
                needsRevised={needsRevised}
              />
             }

             {!isEditingTask && isComplete && !needsRevised &&
             <TaskNextControl
               {...this.props}
               className="mr-mt-1"
               nextTask={this.next}
               loadBy={this.props.taskLoadBy}
               chooseLoadBy={(load) => needsRevised ? this.chooseRevisionLoadBy(load) :
                                        this.chooseLoadBy(load)}
               chooseNextTask={this.chooseNextTask}
               clearNextTask={this.clearNextTask}
               requestedNextTask={this.state.requestedNextTask}
             />
             }

             {this.state.confirmingTask &&
               <TaskConfirmationModal
                 {...this.props}
                 status={this.state.confirmingStatus}
                 comment={this.state.comment}
                 setComment={this.setComment}
                 osmComment={this.state.osmComment}
                 setOSMComment={this.setOSMComment}
                 tags={this.state.tags}
                 setTags={this.setTags}
                 needsReview={this.getNeedsReviewSetting()}
                 toggleNeedsReview={this.toggleNeedsReview}
                 loadBy={needsRevised ? this.state.revisionLoadBy : this.props.taskLoadBy}
                 chooseLoadBy={(load) => needsRevised ? this.chooseRevisionLoadBy(load) :
                                                   this.chooseLoadBy(load)}
                 chooseNextTask={this.chooseNextTask}
                 clearNextTask={this.clearNextTask}
                 requestedNextTask={this.state.requestedNextTask}
                 onConfirm={this.confirmCompletion}
                 onCancel={this.resetConfirmation}
                 needsRevised={this.state.submitRevision}
                 fromInbox={fromInbox}
               />
             }
           </React.Fragment>
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
  WithChallengePreferences(
    WithVisibleLayer(
      WithTaskTags(
        WithTaskReview(
          WithKeyboardShortcuts(
            injectIntl(ActiveTaskControls)
          )
        )
      )
    )
  ),
  'task'
)
