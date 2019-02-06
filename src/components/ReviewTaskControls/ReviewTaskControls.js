import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import TaskCommentInput from '../TaskCommentInput/TaskCommentInput'
import WithTaskReview from '../HOCs/WithTaskReview/WithTaskReview'
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

  /** Save Review Status */
  updateReviewStatus = (reviewStatus) => {
    this.props.updateTaskReviewStatus(this.props.task, reviewStatus, this.state.comment)
    this.props.history.push('/review')
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

  render() {
    const user = this.props.user

    // This task was rejected. It needs to be resubmitted for review
    if (this.props.task.reviewStatus === TaskReviewStatus.rejected) {
      return (
        <div className={classNames("review-task-controls", this.props.className)}>
          <h5>
            <FormattedMessage {...messages.doesTaskNeedReviewAgain} />
            <button className="mr-button mr-button--blue-fill"
                    onClick={() => this.updateReviewStatus(TaskReviewStatus.needed)}>
                <FormattedMessage {...messages.resubmit} />
            </button>
          </h5>
        </div>
      )
    }

    // This task has not been completed yet.
    if (this.props.task.status === TaskStatus.created) {
      return (
        <div className={classNames("review-task-controls", this.props.className)}>
          <h5>
            <FormattedMessage {...messages.taskNotCompleted} />
          </h5>
        </div>
      )
    }

    // The user is not a reviewer
    if (!user.settings.isReviewer) {
      return (
        <div className={classNames("review-task-controls", this.props.className)}>
          <h5>
            <FormattedMessage {...messages.userNotReviewer} />
          </h5>
        </div>
      )
    }

    // A review has not been requested on this task.
    if (this.props.task.reviewStatus === undefined) {
      return (
        <div className={classNames("review-task-controls", this.props.className)}>
          <h5>
            <FormattedMessage {...messages.reviewNotRequested} />
          </h5>
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
        <button className="mr-button mr-button--blue-fill mr-button--small"
                onClick={() => this.stopReviewing()}>
          <FormattedMessage {...messages.stopReview} />
        </button>
        <div className="mr-text-xs mr-text-white mr-flex mr-pt-2 mr-whitespace-no-wrap">
          <h5>
            <FormattedMessage {...messages.currentReviewStatus} />
            <FormattedMessage {...messagesByReviewStatus[this.props.task.reviewStatus]} />
          </h5>
        </div>
        <div className="mr-pr-4 mr-mt-2">
          <TaskCommentInput
            {...this.props}
            className="review-task-controls__task-comment"
            value={this.state.comment}
            commentChanged={this.setComment}
          />
        </div>
        <div className="mr-my-4 mr-grid mr-grid-columns-1 mr-grid-gap-4">
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
        </div>
      </div>
    )
  }
}

ReviewTaskControls.propTypes = {
  /** The task being reviewed */
  task: PropTypes.object,
}

export default WithTaskReview(ReviewTaskControls)
