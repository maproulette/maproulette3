import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, FormattedDate, FormattedTime }
       from 'react-intl'
import { Link } from 'react-router-dom'
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
  notificationBody = () => {
    switch(this.props.notification.notificationType) {
      case NotificationType.mention:
        return <MentionBody {...this.props} />
      case NotificationType.reviewApproved:
      case NotificationType.reviewRejected:
      case NotificationType.reviewAgain:
        return <ReviewBody {...this.props} />
      default:
        return null
    }
  }

  render() {
    return (
      <External>
        <Modal isActive={true} onClose={() => this.props.onClose(this.props.notification)}>
          <div className="mr-bg-blue-dark mr-rounded-t mr-p-6 mr-flex mr-justify-between mr-items-center mr-links-inverse">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <button
              onClick={() => this.props.onDelete(this.props.notification)}
              className="mr-button mr-button--small"
            >
              <FormattedMessage {...messages.deleteNotificationLabel} />
            </button>
          </div>
          <div className="mr-p-6">
            <header>
              <ul className="mr-list-reset mr-mb-2 mr-text-sm mr-flex mr-items-center">
                <li className="mr-mr-4">
                  <span
                    className={`mr-text-sm mr-font-medium mr-uppercase mr-notification-type-${_kebabCase(keysByNotificationType[this.props.notification.notificationType])}`}
                  >
                    <FormattedMessage
                      {...messagesByNotificationType[this.props.notification.notificationType]}
                    />
                  </span>
                </li>
                <li>
                  <span className="mr-font-medium mr-text-grey-light">
                    <FormattedDate
                      value={this.props.notification.created}
                    /> <FormattedTime
                      value={this.props.notification.created}
                    />
                  </span>
                </li>
              </ul>
            </header>
            {this.notificationBody()}
          </div>
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

const AttachedComment = function(props) {
  if (_isEmpty(props.notification.extra)) {
    return null
  }

  return (
    <React.Fragment>
      <p className="mr-text-xs">{props.notification.fromUsername}</p>
      <div className="mr-text-sm mr-rounded-sm mr-p-2 mr-bg-grey-lighter-10">
        <div className="mr-markdown mr-markdown--longtext">
          <Markdown markdown={props.notification.extra} />
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

Notification.propTypes = {
  notification: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default Notification
