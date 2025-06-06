import classNames from "classnames";
import _isEmpty from "lodash/isEmpty";
import _kebabCase from "lodash/kebabCase";
import _map from "lodash/map";
import PropTypes from "prop-types";
import { Component, Fragment, createRef } from "react";
import { FormattedDate, FormattedMessage, FormattedTime } from "react-intl";
import { Link } from "react-router-dom";
import ErrorTagComment from "../../components/ErrorTagComment/ErrorTagComment";
import External from "../../components/External/External";
import Markdown from "../../components/MarkdownContent/MarkdownContent";
import Modal from "../../components/Modal/Modal";
import {
  NotificationType,
  keysByNotificationType,
  messagesByNotificationType,
} from "../../services/Notification/NotificationType/NotificationType";
import { TaskReviewStatus } from "../../services/Task/TaskReview/TaskReviewStatus";
import messages from "./Messages";

class Notification extends Component {
  chosenNotificationRef = createRef();

  notificationBody = (notification) => {
    switch (notification.notificationType) {
      case NotificationType.mention:
        return <MentionBody notification={notification} />;
      case NotificationType.reviewApproved:
      case NotificationType.reviewRejected:
      case NotificationType.reviewAgain:
        return <ReviewBody notification={notification} />;
      case NotificationType.reviewRevised:
        return <ReviewRevisedBody notification={notification} />;
      case NotificationType.metaReview:
      case NotificationType.metaReviewAgain:
        return <MetaReviewBody notification={notification} />;
      case NotificationType.challengeCompleted:
        return <ChallengeCompletionBody notification={notification} />;
      case NotificationType.mapperChallengeCompleted:
        return <MapperChallengeCompletionBody notification={notification} />;
      case NotificationType.team:
        return <TeamBody notification={notification} />;
      case NotificationType.follow:
        return <FollowBody notification={notification} />;
      case NotificationType.challengeComment:
        return <ChallengeCommentBody notification={notification} />;
      case NotificationType.taskUnlockRequest:
        return <TaskUnlockRequestBody notification={notification} />;
      default:
        return null;
    }
  };

  renderedNotification = (notification) => (
    <li
      key={notification.id}
      ref={this.chosenNotificationRef}
      className={classNames("mr-bg-pink-light-10 mr-rounded mr-mb-6", {
        "mr-border mr-border-pink-light-50":
          this.props.thread && notification === this.props.notification,
      })}
    >
      <div className="mr-p-6 mr-flex mr-justify-between mr-items-center mr-links-inverse">
        <header>
          <ul className="mr-list-reset mr-text-sm mr-flex mr-items-center">
            <li className="mr-mr-4">
              <span
                className={`mr-text-sm mr-font-medium mr-uppercase mr-notification-type-${_kebabCase(keysByNotificationType[notification.notificationType])}`}
              >
                <FormattedMessage {...messagesByNotificationType[notification.notificationType]} />
              </span>
            </li>
            <li>
              <span className="mr-font-medium mr-text-grey-light">
                <FormattedDate value={notification.created} />{" "}
                <FormattedTime value={notification.created} />
              </span>
            </li>
          </ul>
        </header>
        <button
          onClick={() => this.props.onDelete(notification)}
          className="mr-button mr-button--small"
        >
          <FormattedMessage {...messages.deleteNotificationLabel} />
        </button>
      </div>
      <div className="mr-p-6 mr-pt-0">{this.notificationBody(notification)}</div>
    </li>
  );

  componentDidMount() {
    // In the case of a thread, scroll to the notification the user clicked on
    // from their inbox
    this.chosenNotificationRef.current.scrollIntoView();
  }

  render() {
    const notifications = this.props.thread ? this.props.thread : [this.props.notification];
    const notificationList = _map(notifications, (notification) =>
      this.renderedNotification(notification),
    );

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
    );
  }
}

const MentionBody = function (props) {
  return (
    <Fragment>
      <p className="mr-mb-8 mr-text-base">
        <FormattedMessage {...messages.mentionNotificationLead} />
      </p>

      <AttachedComment notification={props.notification} />

      <ViewTask notification={props.notification} />
    </Fragment>
  );
};

const ReviewBody = function (props) {
  let lead = null;
  const reviewStatus = parseInt(props.notification.description, 10);

  switch (reviewStatus) {
    case TaskReviewStatus.approved:
      lead = <FormattedMessage {...messages.reviewApprovedNotificationLead} />;
      break;
    case TaskReviewStatus.approvedWithFixes:
      lead = <FormattedMessage {...messages.reviewApprovedWithFixesNotificationLead} />;
      break;
    case TaskReviewStatus.rejected:
      lead = <FormattedMessage {...messages.reviewRejectedNotificationLead} />;
      break;
    case TaskReviewStatus.needed:
      lead = <FormattedMessage {...messages.reviewAgainNotificationLead} />;
      break;
    default:
      lead = null;
  }

  return (
    <Fragment>
      <p className="mr-mb-8 mr-text-base">{lead}</p>

      {props.notification.errorTags ? (
        <div className="mr-text-red">
          <FormattedMessage {...messages.appliedErrorTags} />:{" "}
          <ErrorTagComment errorTags={props.notification.errorTags} />
        </div>
      ) : null}

      <AttachedComment notification={props.notification} />

      <ViewTask
        notification={props.notification}
        review={reviewStatus === TaskReviewStatus.needed}
      />
    </Fragment>
  );
};

const ReviewRevisedBody = function (props) {
  const lead = <FormattedMessage {...messages.reviewRevisedNotificationLead} />;

  return (
    <Fragment>
      <p className="mr-mb-8 mr-text-base">{lead}</p>

      <AttachedComment notification={props.notification} />

      <ViewTask notification={props.notification} review={true} />
    </Fragment>
  );
};

const MetaReviewBody = function (props) {
  let lead = null;
  const reviewStatus = parseInt(props.notification.description, 10);

  switch (reviewStatus) {
    case TaskReviewStatus.approved:
      lead = <FormattedMessage {...messages.metaReviewApprovedNotificationLead} />;
      break;
    case TaskReviewStatus.approvedWithFixes:
      lead = <FormattedMessage {...messages.metaReviewApprovedWithFixesNotificationLead} />;
      break;
    case TaskReviewStatus.rejected:
      lead = <FormattedMessage {...messages.metaReviewRejectedNotificationLead} />;
      break;
    case TaskReviewStatus.needed:
      lead = <FormattedMessage {...messages.metaReviewAgainNotificationLead} />;
      break;
    default:
      lead = null;
  }

  return (
    <Fragment>
      <p className="mr-mb-8 mr-text-base">{lead}</p>

      <AttachedComment notification={props.notification} />

      <ViewTask
        notification={props.notification}
        review={reviewStatus === TaskReviewStatus.needed}
      />
    </Fragment>
  );
};

const ChallengeCompletionBody = function (props) {
  return (
    <Fragment>
      <p className="mr-mb-8 mr-text-base">
        <FormattedMessage {...messages.challengeCompleteNotificationLead} />
      </p>

      <p className="mr-text-md mr-text-yellow">{props.notification.extra}</p>

      <ViewChallengeAdmin notification={props.notification} />
    </Fragment>
  );
};

const MapperChallengeCompletionBody = function (props) {
  return (
    <Fragment>
      <p className="mr-mb-8 mr-text-base">
        <FormattedMessage {...messages.mapperChallengeCompleteNotificationLead} />
      </p>

      <p className="mr-text-md mr-text-yellow">{props.notification.extra}</p>

      <div className="mr-mt-8 mr-links-green-lighter">
        <Link to={{ pathname: `/browse/challenges` }}>
          <FormattedMessage {...messages.findMoreChallengesLabel} />
        </Link>
      </div>
    </Fragment>
  );
};

const TeamBody = function (props) {
  if (props.notification.description !== "invited") {
    return null;
  }

  return (
    <Fragment>
      <p className="mr-mb-8 mr-text-base">
        <FormattedMessage {...messages.teamInviteNotificationLead} />
      </p>

      <p className="mr-text-md mr-text-yellow">{props.notification.extra}</p>

      <div className="mr-mt-8 mr-links-green-lighter">
        <Link to="/teams">
          <FormattedMessage {...messages.viewTeamsLabel} />
        </Link>
      </div>
    </Fragment>
  );
};

const FollowBody = function (props) {
  if (props.notification.description !== "followed") {
    return null;
  }

  return (
    <Fragment>
      <p className="mr-mb-8 mr-text-base">
        <FormattedMessage {...messages.followedNotificationLead} />
      </p>

      <p className="mr-links-green-lighter mr-text-md">
        <Link to={`/user/metrics/${props.notification.fromUsername}`}>
          {props.notification.fromUsername}
        </Link>
      </p>
    </Fragment>
  );
};

const ChallengeCommentBody = function (props) {
  return (
    <Fragment>
      <p className="mr-mb-8 mr-text-base">
        <FormattedMessage {...messages.commentedOnChallenge} />
      </p>

      <AttachedComment notification={props.notification} />

      <ViewTask notification={props.notification} />
    </Fragment>
  );
};

const TaskUnlockRequestBody = function (props) {
  return (
    <Fragment>
      <p className="mr-mb-8 mr-text-base">
        {props.notification.fromUsername} <FormattedMessage {...messages.taskUnlockRequest} />{" "}
        {props.notification.taskId}
      </p>

      <p className="mr-links-green-lighter mr-text-md">
        <Link to={`/task/${props.notification.taskId}}`}>
          <FormattedMessage {...messages.viewTaskLabel} />
        </Link>
      </p>
    </Fragment>
  );
};

const AttachedComment = function (props) {
  if (_isEmpty(props.notification.extra)) {
    return null;
  }

  return (
    <Fragment>
      <p className="mr-text-xs">{props.notification.fromUsername}</p>
      <div className="mr-text-sm mr-rounded-sm mr-p-2 mr-bg-grey-lighter-10">
        <div className="mr-markdown mr-markdown--longtext">
          <Markdown allowShortCodes markdown={props.notification.extra} />
        </div>
      </div>
    </Fragment>
  );
};

const ViewTask = function (props) {
  if (!Number.isFinite(props.notification.challengeId)) {
    return null;
  }
  const taskSpecific =
    props.notification.taskId !== props.notification.challengeName && props.notification.taskId;
  const path = taskSpecific
    ? `challenge/${props.notification.challengeId}/task/${props.notification.taskId}`
    : `browse/challenges/${props.notification.challengeId}?tab=conversation`;

  const isMetaReReview = props.notification.notificationType === NotificationType.metaReviewAgain;
  const needsReReview =
    props.notification.notificationType === NotificationType.metaReview &&
    parseInt(props.notification.description, 10) === TaskReviewStatus.rejected;

  const label = taskSpecific ? messages.viewTaskLabel : messages.viewConversationLabel;

  return (
    <div className="mr-mt-8 mr-links-green-lighter">
      <div className="mr-flex mr-leading-tight">
        <Link to={path}>
          <FormattedMessage {...label} />
        </Link>

        {(props.review || needsReReview) && (
          <Link
            to={{
              pathname: `${path}/${isMetaReReview ? "meta-review" : "review"}`,
              state: { fromInbox: true },
            }}
            className="mr-pl-4 mr-ml-4 mr-border-l mr-border-white-10"
          >
            <FormattedMessage {...messages.reviewTaskLabel} />
          </Link>
        )}
      </div>
    </div>
  );
};

const ViewChallengeAdmin = function (props) {
  if (
    !Number.isFinite(props.notification.challengeId) ||
    !Number.isFinite(props.notification.projectId)
  ) {
    return null;
  }

  return (
    <div className="mr-mt-8 mr-links-green-lighter">
      <Link
        to={{
          pathname: `admin/project/${props.notification.projectId}/challenge/${props.notification.challengeId}`,
          state: { fromInbox: true },
        }}
      >
        <FormattedMessage {...messages.manageChallengeLabel} />
      </Link>
    </div>
  );
};

Notification.propTypes = {
  notification: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Notification;
