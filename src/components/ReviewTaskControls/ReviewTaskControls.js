import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import TaskCommentInput from '../TaskCommentInput/TaskCommentInput'
import WithTaskReview from '../HOCs/WithTaskReview/WithTaskReview'
import WithKeyboardShortcuts from '../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import WithEditor from '../HOCs/WithEditor/WithEditor'
import TaskEditControl from '../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskEditControl/TaskEditControl'
import UserEditorSelector
       from '../UserEditorSelector/UserEditorSelector'
import TaskConfirmationModal from '../TaskConfirmationModal/TaskConfirmationModal'
import { TaskReviewStatus } from '../../services/Task/TaskReview/TaskReviewStatus'
import { TaskStatus } from '../../services/Task/TaskStatus/TaskStatus'
import { messagesByReviewStatus } from '../../services/Task/TaskReview/TaskReviewStatus'
import messages from './Messages'
import './ReviewTaskControls.scss'

/**
 * ReviewTaskControls presents controls used to update the task review status.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ReviewTaskControls extends Component {
  state = {
    comment: "",
  }

  setComment = comment => this.setState({comment})

  onConfirm = () => {
    this.props.updateTaskReviewStatus(this.props.task, this.state.reviewStatus,
                                      this.state.comment)
    this.props.history.push('/review')
  }

  onCancel = () => {
    this.setState({confirmingTask: false})
  }

  /** Save Review Status */
  updateReviewStatus = (reviewStatus) => {
    this.setState({reviewStatus, confirmingTask: true})
  }

  /** Stop Reviewing (release claim) */
  stopReviewing = () => {
    this.props.stopReviewing(this.props.task)
    this.props.history.push('/review')
  }

  /** Start Reviewing (claim this task) */
  startReviewing = () => {
    this.props.startReviewing(this.props.task)
  }

  /** Choose which editor to launch for fixing a task */
  pickEditor = ({ value }) => {
    this.setState({taskBeingCompleted: this.props.task.id})
    this.props.editTask(value, this.props.task, {zoom: 20})
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

    return (
      <div className={classNames("review-task-controls", this.props.className)}>
        <div className="mr-text-sm mr-text-white mr-mt-2 mr-whitespace-no-wrap">
          <FormattedMessage
            {...messages.currentReviewStatus}
          /> <FormattedMessage
            {...messagesByReviewStatus[this.props.task.reviewStatus]}
          />
        </div>

        <div>
          <UserEditorSelector {...this.props} className="mr-mb-4" />
          <div className="mr-mt-4 mr-mb-12 mr-grid mr-grid-columns-2 mr-grid-gap-4">
            <TaskEditControl {...this.props} pickEditor={this.pickEditor} />
          </div>
        </div>

        <div className="mr-my-4 mr-grid mr-grid-columns-2 mr-grid-gap-4">
          <button className="mr-button mr-button--blue-fill"
                  onClick={() => this.updateReviewStatus(TaskReviewStatus.approved)}>
            <FormattedMessage {...messages.approved} />
          </button>
          <button className="mr-button mr-button--blue-fill"
                  onClick={() => this.updateReviewStatus(TaskReviewStatus.rejected)}>
            <FormattedMessage {...messages.rejected} />
          </button>
          <button className="mr-button mr-button--blue-fill"
                  onClick={() => this.updateReviewStatus(TaskReviewStatus.approvedWithFixes)}>
            <FormattedMessage {...messages.approvedWithFixes} />
          </button>
          <button className="mr-button mr-button--white"
                  onClick={() => this.stopReviewing()}>
            <FormattedMessage {...messages.stopReview} />
          </button>
        </div>

        {this.state.confirmingTask &&
          <TaskConfirmationModal
            {...this.props}
            task={this.props.task}
            status={this.state.reviewStatus}
            comment={this.state.comment}
            setComment={this.setComment}
            onConfirm={this.onConfirm}
            onCancel={this.onCancel}
            inReview={true}
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

export default WithTaskReview(WithEditor(WithKeyboardShortcuts(ReviewTaskControls)))
