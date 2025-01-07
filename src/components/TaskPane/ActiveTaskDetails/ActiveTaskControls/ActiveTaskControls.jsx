import { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from "react-router-dom";
import _get from 'lodash/get'
import _map from 'lodash/map'
import _pick from 'lodash/pick'
import _isEmpty from 'lodash/isEmpty'
import _remove from 'lodash/remove'
import _cloneDeep from 'lodash/cloneDeep'
import _isObject from 'lodash/isObject'
import _isFinite from 'lodash/isFinite'
import _isUndefined from 'lodash/isUndefined'
import { TaskStatus } from '../../../../services/Task/TaskStatus/TaskStatus'
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
import WithTaskFeatureProperties from '../../../HOCs/WithTaskFeatureProperties/WithTaskFeatureProperties'
import TaskCompletionStep from './TaskCompletionStep/TaskCompletionStep'
import CooperativeWorkControls from './CooperativeWorkControls/CooperativeWorkControls'
import TaskNextControl from './TaskNextControl/TaskNextControl'
import TaskConfirmationModal
       from '../../../TaskConfirmationModal/TaskConfirmationModal'
import TaskTags from '../../../TaskTags/TaskTags'
import messages from './Messages'
import { constructChangesetUrl } from '../../../../utils/constructChangesetUrl'
import { replacePropertyTags } from '../../../../hooks/UsePropertyReplacement/UsePropertyReplacement'
import './ActiveTaskControls.scss'

const hiddenShortcutGroup = 'taskCompletion'
const hiddenShortcuts = ['skip', 'falsePositive', 'fixed', 'tooHard', 'alreadyFixed']

/**
 * ActiveTaskControls renders the appropriate controls for the given
 * active task based on the state of the task and editing workflow.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ActiveTaskControls extends Component {
  state = {
    confirmingTask: null,
    confirmingStatus: null,
    osmComment: "",
    comment: "",
    tags: null,
    revisionLoadBy: TaskReviewLoadMethod.all,
    doneLoadByFromHistory: false,
    needsReview: this.props.challenge.reviewSetting === 1 ? true : undefined
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
    const {task, taskFeatureProperties} = this.props

    const comment = task.parent.checkinComment
    const replacedComment = replacePropertyTags(comment, taskFeatureProperties, false)

    this.props.editTask(
      value,
      this.props.task,
      this.props.mapBounds,
      {
        imagery: this.props.source.id !== OPEN_STREET_MAP ? this.props.source : undefined,
        photoOverlay: this.props.showMapillaryLayer ? 'mapillary' : null,
      },
      this.props.taskBundle,
      replacedComment
    )
  }

  chooseLoadBy = loadMethod => {
    const isVirtual = _isFinite(this.props.virtualChallengeId)
    const challengeId = isVirtual ? this.props.virtualChallengeId :
                                    this.props.challengeId
    this.props.updateUserAppSetting(this.props.user.id, {
      'loadMethod': loadMethod,
    })     
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

  /** Mark the task as complete with the given status */
  complete = taskStatus => {
    if(this.state.tags) {
      this.props.saveTaskTags(this.props.task, this.state.tags)
    }
    this.props.setCompletingTask(this.props.task.id)

    const revisionSubmission = this.props.task.reviewStatus === TaskReviewStatus.rejected

    if (!_isUndefined(this.state.submitRevision)) {
      this.props.updateTaskReviewStatus(this.props.task, this.state.submitRevision,
                                        this.state.comment, null,
                                        this.state.revisionLoadBy, this.props.history,
                                        this.props.taskBundle, this.state.requestedNextTask,
                                        taskStatus, null)
    }
    else {
      this.props.completeTask(this.props.task, this.props.task.parent.id,
                              taskStatus, this.state.comment, null,
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
    const intl = this.props.intl
    const message = intl.formatMessage(messages.rapidDiscardUnsavedChanges)

    if (!this.props.rapidEditorState.hasUnsavedChanges || window.confirm(message)) {
      const requireComment = this.props.challenge.requireComment || this.props.challenge.parent.requireComment;
      const disableTaskConfirm = !requireComment && this.props.user.settings.disableTaskConfirm

      if (disableTaskConfirm) {
        this.setState({
          osmComment: `${this.props.task.parent.checkinComment}${constructChangesetUrl(this.props.task)}`,
          confirmingStatus: taskStatus,
          submitRevision,
        }, () => {
          this.confirmCompletion()
        })
      } else {
        this.setState({
          confirmingTask: this.props.task,
          osmComment: `${this.props.task.parent.checkinComment}${constructChangesetUrl(this.props.task)}`,
          confirmingStatus: taskStatus,
          submitRevision,
        })
      }
    }
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

  openCompletionModal = (key) => {
    // Ignore if the shortcut group is not active
    if (_isEmpty(this.props.activeKeyboardShortcuts?.[hiddenShortcutGroup])) {
      return;
    }

    // Handle different keyboard shortcuts
    switch (key) {
      case 'f':
        this.initiateCompletion(TaskStatus.fixed)
        break
      case 'd':
        this.initiateCompletion(TaskStatus.tooHard)
        break
      case 'x':
        this.initiateCompletion(TaskStatus.alreadyFixed)
        break
      case 'w':
        this.initiateCompletion(TaskStatus.skipped)
        break
      case 'q':
        this.initiateCompletion(TaskStatus.falsePositive)
        break
      default:
        break // Handle other keys or do nothing
    }
  }

  handleKeyboardShortcuts = (event) => {
    if (_isEmpty(this.props.activeKeyboardShortcuts[hiddenShortcutGroup])) {
      return
    }

    if (this.props.textInputActive(event)) {
      return // Ignore typing in inputs
    }

    if (event.metaKey || event.altKey || event.ctrlKey) {
      return
    }

    this.openCompletionModal(event.key)
    event.preventDefault()
  }

  componentDidUpdate(prevProps) {
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
      const tagsArray = _map(this.props.task.tags, (tag) => tag.name);
      const filteredTagsArray = tagsArray.filter((tag) => tag !== "");
      const uniqueTagsArray = filteredTagsArray.filter((value, index, self) => self.indexOf(value) === index);
      const tags = uniqueTagsArray.join(',');

      if(tags.length > 0 && this.state.tags === null) {
        this.setState({tags: tags})
      }

      if (prevProps.task.id !== this.props.task.id) {
        // Clear tags if we are on a new task
        this.setState({tags: tags ?? null})
      }
    }

    // Let's set default revisionLoadBy to inbox if we are coming from inbox
    // and not changing revisionLoadBy state
    if (_get(this.props.history, 'location.state.fromInbox') &&
        this.state.revisionLoadBy !== TaskReviewLoadMethod.inbox &&
        !this.state.doneLoadByFromHistory) {
      return this.setState({revisionLoadBy: TaskReviewLoadMethod.inbox,
                            doneLoadByFromHistory: true})
    }

    if((!AsCooperativeWork(this.props.task).isTagType() || !this.props.user.settings.seeTagFixSuggestions)) {
      const editMode = this.props.getUserAppSetting ? this.props.getUserAppSetting(this.props.user, 'isEditMode') : false;
      if (
        !_isEmpty(this.props.activeKeyboardShortcuts?.[hiddenShortcutGroup]) &&
        editMode
      ) {
        hiddenShortcuts.forEach((shortcut) => {
          this.props.deactivateKeyboardShortcut(
            hiddenShortcutGroup,
            shortcut,
            this.handleKeyboardShortcuts
          );
        });
      } else if (
        _isEmpty(this.props.activeKeyboardShortcuts?.[hiddenShortcutGroup]) &&
        this.props.keyboardShortcutGroups &&
        this.props.activateKeyboardShortcut &&
        !editMode
      ) {
        hiddenShortcuts.forEach((shortcut) => {
          this.props.activateKeyboardShortcut(
            hiddenShortcutGroup,
            _pick(this.props.keyboardShortcutGroups.taskCompletion, shortcut),
            this.handleKeyboardShortcuts
          )
        })
      }
    }
  }

  componentWillUnmount() {
    if (!_isEmpty(this.props.activeKeyboardShortcuts?.[hiddenShortcutGroup])) {
      hiddenShortcuts.forEach((shortcut) => {
        this.props.deactivateKeyboardShortcut(
          hiddenShortcutGroup,
          shortcut,
          this.handleKeyboardShortcuts
        )
      })
    }
  }

  render() {
    console.log(this.props.user.settings, this.props.user.settings.disableTaskConfirm)
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

    if (!this.props.task) {
      return null
    }

    const isCooperative = AsCooperativeWork(this.props.task).isCooperative()
    const isTagFix = AsCooperativeWork(this.props.task).isTagType() // isTagFix == true implies isCooperative == true too

    const disableRapid = isCooperative || this.props.taskReadOnly || (
      this.props.task?.status !== 0 && ( 
      this.props.completedBy !== this.props.user && 
      this.props.task?.reviewClaimedBy !== this.props.user
      )
    )
    const editMode = disableRapid ? false : this.props.getUserAppSetting ? this.props.getUserAppSetting(this.props.user, 'isEditMode') : false

    const needsRevised = this.props.task.reviewStatus === TaskReviewStatus.rejected

    const fromInbox = _get(this.props.history, 'location.state.fromInbox')

    const allowedProgressions =
      allowedStatusProgressions(this.props.task.status, false, needsRevised)
    const isComplete = isCompletionStatus(this.props.task.status)
    const isFinal = isFinalStatus(this.props.task.status)

    return (
      <div>
        {isComplete &&
         <div className="mr-text-sm mr-text-white mr-whitespace-nowrap">
           <div className="mr-flex mr-mb-2 mr-text-sm mr-text-white mr-whitespace-nowrap">
             <span>
               <FormattedMessage
                 {...messages.markedAs}
               /> <FormattedMessage
                 {...messagesByStatus[this.props.task.status]}
               />
             </span>
             {this.props.task.changesetId > 0 &&
              <a
                href={`${window.env.REACT_APP_OSM_API_SERVER}/changeset/${this.props.task.changesetId}`}
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
              <div className="mr-text-sm mr-text-white mr-whitespace-nowrap">
                <FormattedMessage {...messages.awaitingReview} />
              </div>
           }
         </div>
        }

        <TaskTags
          user={this.props.user.id}
          task={this.props.task}
          tags={this.state.tags}
          setTags={this.setTags}
          onConfirm={this.confirmCompletion}
          saveTaskTags={this.props.saveTaskTags}
          taskReadOnly={this.props.taskReadOnly}
        />

        {this.props.taskReadOnly ?
         <div>
           <div className="mr-mt-4 mr-text-lg mr-text-pink-light">
             <FormattedMessage {...messages.readOnly} />
           </div>
           <Link to={`/browse/challenges/${this.props.challengeId}`}>
             <button className="mr-mt-4 mr-button">
               <FormattedMessage {...messages.browseChallenge} />
             </button>
           </Link>
         </div> :
         <Fragment>
           {isTagFix && (!isFinal || needsRevised) && this.props.user.settings.seeTagFixSuggestions &&
             <CooperativeWorkControls
               {...this.props}
               allowedProgressions={allowedProgressions}
               pickEditor={this.pickEditor}
               complete={this.initiateCompletion}
               nextTask={this.next}
               needsRevised={needsRevised}
             />
           }

           {(!isTagFix || !this.props.user.settings.seeTagFixSuggestions) && (!isFinal || needsRevised) &&
             <TaskCompletionStep
              {...this.props}
              allowedEditors={this.allowedEditors()}
              allowedProgressions={allowedProgressions}
              pickEditor={this.pickEditor}
              complete={this.initiateCompletion}
              nextTask={this.next}
              needsRevised={needsRevised}
              editMode={editMode}
            />
           }

           {isComplete && !needsRevised &&
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
         </Fragment>
        }
      </div>
    );
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
            WithTaskFeatureProperties(
              injectIntl(ActiveTaskControls)
            )
          )
        )
      )
    )
  ),
  'task'
)
