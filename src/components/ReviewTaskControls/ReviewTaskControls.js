import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _merge from 'lodash/merge'
import _cloneDeep from 'lodash/cloneDeep'
import _isUndefined from 'lodash/isUndefined'
import { FormattedMessage } from 'react-intl'
import { TaskReviewStatus } from '../../services/Task/TaskReview/TaskReviewStatus'
import { TaskStatus, messagesByStatus }
       from '../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewLoadMethod } from '../../services/Task/TaskReview/TaskReviewLoadMethod'
import { messagesByReviewStatus } from '../../services/Task/TaskReview/TaskReviewStatus'
import WithTaskTags from '../HOCs/WithTaskTags/WithTaskTags'
import WithSearch from '../HOCs/WithSearch/WithSearch'
import WithKeyboardShortcuts from '../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import WithEditor from '../HOCs/WithEditor/WithEditor'
import WithTaskFeatureProperties from '../HOCs/WithTaskFeatureProperties/WithTaskFeatureProperties'
import { replacePropertyTags } from '../../hooks/UsePropertyReplacement/UsePropertyReplacement'
import TaskEditControl from '../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskEditControl/TaskEditControl'
import UserEditorSelector
       from '../UserEditorSelector/UserEditorSelector'
import TaskConfirmationModal from '../TaskConfirmationModal/TaskConfirmationModal'
import messages from './Messages'
import './ReviewTaskControls.scss'
import ErrorTagComment from '../ErrorTagComment/ErrorTagComment'

/**
 * ReviewTaskControls presents controls used to update the task review status.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ReviewTaskControls extends Component {
  state = {
    comment: "",
    tags: "",
    loadBy: TaskReviewLoadMethod.next,
    errorTags: []
  }

  setComment = comment => this.setState({comment})
  setTags = tags => this.setState({tags})

  onConfirm = (alternateCriteria) => {
    const history = _cloneDeep(this.props.history)
    _merge(_get(history, 'location.state', {}), alternateCriteria)

    const requestedNextTask = !this.state.requestedNextTask ? null :
      {id: this.state.requestedNextTask, parent: this.state.requestedNextTaskParent}

    const errorTags = this.state.errorTags?.length ? this.state.errorTags : undefined

    this.props.updateTaskReviewStatus(this.props.task, this.state.reviewStatus,
                                     this.state.comment, this.state.tags,
                                     this.state.loadBy, history,
                                     this.props.taskBundle, requestedNextTask, null, errorTags)
    this.setState({ confirmingTask: false, comment: "", errorTags: [] })
  }

  handleChangeErrorTag = (e, i) => {
    const newTags = this.state.errorTags;
    newTags[i] = Number(e.target.value);
    this.setState({ errorTags: newTags })
  }

  handleAddErrorTag = () => {
    const newTags = this.state.errorTags;
    newTags.push(-1);
    this.setState({ errorTags: newTags });
  }

  handleRemoveErrorTag = (index) => {
    const newTags = this.state.errorTags;
    newTags.splice(index, 1);
    this.setState({ errorTags: newTags });
  }

  onCancel = () => {
    this.setState({ confirmingTask: false, errorTags: [] })
  }

  chooseLoadBy = (loadBy) => {
    this.setState({loadBy})
  }

  chooseNextTask = (challengeId, isVirtual, taskId) => {
    this.setState({requestedNextTask: taskId,
                   requestedNextTaskParent: challengeId})
  }

  clearNextTask = () => {
    this.setState({requestedNextTask: null})
  }

  /** Save Review Status */
  updateReviewStatus = (reviewStatus) => {
    this.setState({reviewStatus, confirmingTask: true})
  }

  /** Skip review of this task */
  skipReview = () => {
    this.props.skipTaskReview(this.props.task, this.state.loadBy,
                              this.props.history, this.props.taskBundle)
    this.setState({confirmingTask: false, comment: ""})
  }

  /** Start Reviewing (claim this task) */
  startReviewing = () => {
    this.props.startReviewing(this.props.task)
  }

  /** Choose which editor to launch for fixing a task */
  pickEditor = ({ value }) => {
    const {task, taskFeatureProperties} = this.props
    const comment = task.parent.checkinComment
    const replacedComment = replacePropertyTags(comment, taskFeatureProperties, false)

    this.setState({taskBeingCompleted: this.props.task.id})
    this.props.editTask(value, this.props.task, this.props.mapBounds, null, this.props.taskBundle, replacedComment)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.task.id !== this.props.task.id) {
      // Clear tags if we are on a new task
      this.setState({tags: ""})
    }
  }

  render() {
    const user = this.props.user

    // This task has not been completed yet.
    if (this.props.task.status === TaskStatus.created) {
      return (
        <div className="mr-text-white mr-text-md mr-mt-4 mr-mx-4">
          <FormattedMessage {...messages.taskNotCompleted} />
        </div>
      )
    }

    // The user is not a reviewer
    if (!user.settings.isReviewer) {
      return (
        <div className="mr-text-white mr-text-md mr-mt-4 mr-mx-4">
          <FormattedMessage {...messages.userNotReviewer} />
        </div>
      )
    }

    // Cannot review own task unless a superuser
    if (this.props.task.reviewRequestedBy === user.id && !user.isSuperUser) {
      return (
        <div className="mr-text-white mr-text-md mr-mt-4 mr-mx-4">
          <FormattedMessage {...messages.reviewerIsMapper} />
        </div>
      )
    }

    // A review has not been requested on this task.
    if (this.props.task.reviewStatus === undefined) {
      return (
        <div className="mr-text-white mr-text-md mr-mt-4 mr-mx-4">
          <FormattedMessage {...messages.reviewNotRequested} />
        </div>
      )
    }

    // This task has not been claimed yet for review.
    if (!this.props.task.reviewClaimedBy) {
      return (
        <div className={classNames("review-task-controls", this.props.className)}>
          <h5>
            <button className="mr-button mr-button--blue-fill mr-button--small"
                    onClick={() => this.startReviewing()}>
              <FormattedMessage {...messages.startReview} />
            </button>
          </h5>
        </div>
      )
    }

    // This task has been claimed by someone else.
    if (this.props.task.reviewClaimedBy !== user.id) {
      return (
        <div className={classNames("review-task-controls", this.props.className)}>
          <h5>
            <FormattedMessage {...messages.reviewAlreadyClaimed} />
          </h5>
        </div>
      )
    }

    const fromInbox = _get(this.props.history, 'location.state.fromInbox')
    const tags = _map(this.props.task.tags, (tag) => tag.name)
    const errorTags = this.props.task.errorTags;
    const isMetaReview = this.props.history?.location?.pathname?.includes("meta-review")
    const reviewData = this.props.task?.review;

    const isRevision = (!isMetaReview && Boolean(reviewData?.reviewedBy) && reviewData?.reviewStatus !== TaskReviewStatus.approved) ||
      (isMetaReview && Boolean(reviewData?.metaReviewedBy));

    return (
      <div className={classNames("review-task-controls", this.props.className)}>
        <div className="mr-text-sm mr-text-white mr-mt-4 mr-whitespace-nowrap">
          <FormattedMessage
            {...messages.currentTaskStatus}
          /> 
          <FormattedMessage
            {...messagesByStatus[this.props.task.status]}
          />
        </div>

        <div className="mr-text-sm mr-text-white mr-whitespace-nowrap">
          <FormattedMessage
            {...messages.currentReviewStatus}
          /> 
          <FormattedMessage
            {...messagesByReviewStatus[this.props.task.reviewStatus]}
          />
        </div>

        {isMetaReview &&
          <div className="mr-text-sm mr-text-white mr-whitespace-nowrap">
            <FormattedMessage
              {...messages.currentMetaReviewStatus}
            /> 
            { _isUndefined(this.props.task.metaReviewStatus) ?
              <span/> :
              <FormattedMessage
                {...messagesByReviewStatus[this.props.task.metaReviewStatus]}
              />
            }
          </div>
        }
        {tags.length > 0 &&
          <div className="mr-text-sm mr-text-white">
            <FormattedMessage
              {...messages.taskTags}
            /> {tags.join(', ')}
          </div>
        }
        {
          errorTags
            ?  <div className="mr-text-red">
                <FormattedMessage
                  {...messages.errorTags}
                />:{" "}
                <ErrorTagComment errorTags={errorTags} />
              </div>
            : null
        }

        <div className="mr-my-4">
          <UserEditorSelector {...this.props} />
          <div className="mr-mt-4 mr-mb-12 mr-grid mr-grid-columns-2 mr-grid-gap-4">
            <TaskEditControl {...this.props} pickEditor={this.pickEditor} />
            {this.props.task.metaReviewStatus === TaskReviewStatus.rejected &&
              <button className="mr-button mr-button--blue-fill"
                      onClick={() => this.updateReviewStatus(TaskReviewStatus.needed)}>
                <FormattedMessage {...messages.requestMetaReReview} />
              </button>
            }
          </div>
        </div>

        {this.props.task.metaReviewStatus === TaskReviewStatus.rejected &&
          <div className="mr-my-4 mr-text-yellow mr-text-mango mr-text-lg">
            <FormattedMessage {...messages.changeReview} />
          </div>
        }

        <div className="mr-my-4 mr-grid mr-grid-columns-2 mr-grid-gap-4">
          {
            isRevision 
              ?  <button className="mr-button mr-button--blue-fill"
                    onClick={() => this.updateReviewStatus(TaskReviewStatus.approvedWithRevisions)}>
                  <FormattedMessage {...messages.approvedWithRevisions} />
                </button>
              : <button className="mr-button mr-button--blue-fill"
                    onClick={() => this.updateReviewStatus(TaskReviewStatus.approved)}>
                  <FormattedMessage {...messages.approved} />
                </button>
          }
          <button className="mr-button mr-button--blue-fill"
                  onClick={() => this.updateReviewStatus(TaskReviewStatus.rejected)}>
            <FormattedMessage {...messages.rejected} />
          </button>
          {
            isRevision 
              ?  <button className="mr-button mr-button--blue-fill"
                    onClick={() => this.updateReviewStatus(TaskReviewStatus.approvedWithFixesAfterRevisions)}>
                  <FormattedMessage {...messages.approvedWithFixesAfterRevisions} />
                </button>
              : <button className="mr-button mr-button--blue-fill"
                    onClick={() => this.updateReviewStatus(TaskReviewStatus.approvedWithFixes)}>
                  <FormattedMessage {...messages.approvedWithFixes} />
                </button>
          }
          <button className="mr-button mr-button--white"
                  onClick={() => this.skipReview()}>
            {this.props.asMetaReview ?
              <FormattedMessage {...messages.skipMetaReview} /> :
              <FormattedMessage {...messages.skipReview} />
            }
          </button>
        </div>

        {this.state.confirmingTask &&
          <TaskConfirmationModal
            {...this.props}
            task={this.props.task}
            status={this.state.reviewStatus}
            comment={this.state.comment}
            setComment={this.setComment}
            tags={this.state.tags}
            setTags={this.setTags}
            onConfirm={this.onConfirm}
            onCancel={this.onCancel}
            chooseLoadBy={this.chooseLoadBy}
            loadBy={this.state.loadBy}
            inReview={true}
            fromInbox={fromInbox}
            chooseNextTask={this.chooseNextTask}
            clearNextTask={this.clearNextTask}
            requestedNextTask={this.state.requestedNextTask}
            errorTags={this.state.errorTags}
            onChangeErrorTag={this.handleChangeErrorTag}
            addErrorTag={this.handleAddErrorTag}
            removeErrorTag={this.handleRemoveErrorTag}
          />
        }
      </div>
    )
  }
}

ReviewTaskControls.propTypes = {
  /** The task being reviewed */
  task: PropTypes.object,
}

export default
  WithSearch(
    WithTaskTags(
      WithEditor(
        WithKeyboardShortcuts(
          WithTaskFeatureProperties(ReviewTaskControls)
        )
      )
    ),
    'task'
  )
