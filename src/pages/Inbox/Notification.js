import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, FormattedDate, FormattedTime }
       from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import _isFinite from 'lodash/isFinite'
import _isEmpty from 'lodash/isEmpty'
import _kebabCase from 'lodash/kebabCase'
import { NotificationType, keysByNotificationType, messagesByNotificationType }
       from '../../services/Notification/NotificationType/NotificationType'
import { TaskReviewStatus }
       from '../../services/Task/TaskReview/TaskReviewStatus'
import External from '../../components/External/External'
import Modal from '../../components/Modal/Modal'
import Markdown from '../../components/MarkdownContent/MarkdownContent'
import messages from './Messages'

class Notification extends Component {
  chosenNotificationRef = React.createRef()

  notificationBody = notification => {
    switch(notification.notificationType) {
      case NotificationType.mention:
        return <MentionBody notification={notification} />
      case NotificationType.reviewApproved:
      case NotificationType.reviewRejected:
      case NotificationType.reviewAgain:
        return <ReviewBody notification={notification} />
      case NotificationType.challengeCompleted:
        return <ChallengeCompletionBody notification={notification} />
      default:
        return null
    }
  }

  renderedNotification = notification => (
    <li
      key={notification.id}
      ref={notification === this.props.notification ? this.chosenNotificationRef : undefined}
      className={classNames(
        "mr-bg-pink-light-10 mr-rounded mr-mb-6",
        {"mr-border mr-border-pink-light-50": this.props.thread && notification === this.props.notification}
      )}
    >
      <div className="mr-p-6 mr-flex mr-justify-between mr-items-center mr-links-inverse">
        <header>
          <ul className="mr-list-reset mr-text-sm mr-flex mr-items-center">
            <li className="mr-mr-4">
              <span
                className={`mr-text-sm mr-font-medium mr-uppercase mr-notification-type-${_kebabCase(keysByNotificationType[notification.notificationType])}`}
              >
                <FormattedMessage
                  {...messagesByNotificationType[notification.notificationType]}
                />
              </span>
            </li>
            <li>
              <span className="mr-font-medium mr-text-grey-light">
                <FormattedDate
                  value={notification.created}
                /> <FormattedTime
                  value={notification.created}
                />
              </span>
            </li>
          </ul>
        </header>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <button
          onClick={() => this.props.onDelete(notification)}
          className="mr-button mr-button--small"
        >
          <FormattedMessage {...messages.deleteNotificationLabel} />
        </button>
      </div>
      <div className="mr-p-6 mr-pt-0">
        {this.notificationBody(notification)}
      </div>
    </li>
  )

  componentDidMount() {
    // In the case of a thread, scroll to the notification the user clicked on
    // from their inbox
    this.chosenNotificationRef.current.scrollIntoView()
  }

  render() {
    const notifications = this.props.thread ? this.props.thread : [this.props.notification]
    const notificationList =
      _map(notifications, notification => this.renderedNotification(notification))

    return (
      <External>
        <Modal
          contentClassName="mr-pr-0"
          isActive={true}
          onClose={() => this.props.onClose(this.props.notification)}
        >
          <ul className="mr-list-reset mr-mt-6 mr-pr-8 mr-max-h-screen80 mr-overflow-y-auto">
            {notificationList}
          </ul>
        </Modal>
      </External>
    )
  }
}

const MentionBody = function(props) {
  return (
    <React.Fragment>
      <p className="mr-mb-8 mr-text-base">
        <FormattedMessage {...messages.mentionNotificationLead} />
      </p>

      <AttachedComment notification={props.notification} />

      <ViewTask notification={props.notification} />
    </React.Fragment>
  )
}

const ReviewBody = function(props) {
  let lead = null
  const reviewStatus = parseInt(props.notification.description, 10)

  switch(reviewStatus) {
    case TaskReviewStatus.approved:
      lead = <FormattedMessage {...messages.reviewApprovedNotificationLead} />
      break
    case TaskReviewStatus.approvedWithFixes:
      lead = <FormattedMessage {...messages.reviewApprovedWithFixesNotificationLead} />
      break
    case TaskReviewStatus.rejected:
      lead = <FormattedMessage {...messages.reviewRejectedNotificationLead} />
      break
    case TaskReviewStatus.needed:
      lead = <FormattedMessage {...messages.reviewAgainNotificationLead} />
      break
    default:
      lead = null
  }

  return (
    <React.Fragment>
      <p className="mr-mb-8 mr-text-base">{lead}</p>

      <AttachedComment notification={props.notification} />

      <ViewTask
        notification={props.notification}
        review={reviewStatus === TaskReviewStatus.needed}
      />
    </React.Fragment>
  )
}

const ChallengeCompletionBody = function(props) {
  return (
    <React.Fragment>
      <p className="mr-mb-8 mr-text-base">
        <FormattedMessage {...messages.challengeCompleteNotificationLead} />
      </p>

      <p className="mr-text-md mr-text-yellow">{props.notification.extra}</p>

      <ViewChallengeAdmin notification={props.notification} />
    </React.Fragment>
  )
}

const AttachedComment = function(props) {
  if (_isEmpty(props.notification.extra)) {
    return null
  }

  return (
    <React.Fragment>
      <p className="mr-text-xs">{props.notification.fromUsername}</p>
      <div className="mr-text-sm mr-rounded-sm mr-p-2 mr-bg-grey-lighter-10">
        <div className="mr-markdown mr-markdown--longtext">
          <Markdown allowShortCodes markdown={props.notification.extra} />
        </div>
      </div>
    </React.Fragment>
  )
}

const ViewTask = function(props) {
  if (!_isFinite(props.notification.challengeId) ||
      !_isFinite(props.notification.taskId)) {
    return null
  }

  return (
    <div className="mr-mt-8">
      <Link to={{
              pathname: `challenge/${props.notification.challengeId}/task/${props.notification.taskId}`,
              state: {fromInbox: true}
            }}>
        <FormattedMessage {...messages.viewTaskLabel} />
      </Link>
    </div>
  )
}

const ViewChallengeAdmin = function(props) {
  if (!_isFinite(props.notification.challengeId) ||
      !_isFinite(props.notification.projectId)) {
    return null
  }

  return (
    <div className="mr-mt-8">
      <Link to={{
        pathname: `admin/project/${props.notification.projectId}/challenge/${props.notification.challengeId}`,
        state: {fromInbox: true}
      }}>
        <FormattedMessage {...messages.manageChallengeLabel} />
      </Link>
    </div>
  )
}

Notification.propTypes = {
  notification: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default Notification
