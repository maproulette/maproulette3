import classNames from "classnames";
import _cloneDeep from "lodash/cloneDeep";
import _isUndefined from "lodash/isUndefined";
import _map from "lodash/map";
import _merge from "lodash/merge";
import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { replacePropertyTags } from "../../hooks/UsePropertyReplacement/UsePropertyReplacement";
import { TaskReviewLoadMethod } from "../../services/Task/TaskReview/TaskReviewLoadMethod";
import { TaskReviewStatus } from "../../services/Task/TaskReview/TaskReviewStatus";
import { messagesByReviewStatus } from "../../services/Task/TaskReview/TaskReviewStatus";
import { TaskStatus, messagesByStatus } from "../../services/Task/TaskStatus/TaskStatus";
import WithEditor from "../HOCs/WithEditor/WithEditor";
import WithKeyboardShortcuts from "../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts";
import WithSearch from "../HOCs/WithSearch/WithSearch";
import WithTaskFeatureProperties from "../HOCs/WithTaskFeatureProperties/WithTaskFeatureProperties";
import WithTaskTags from "../HOCs/WithTaskTags/WithTaskTags";
import TaskConfirmationModal from "../TaskConfirmationModal/TaskConfirmationModal";
import TaskTags from "../TaskTags/TaskTags";
import UserEditorSelector from "../UserEditorSelector/UserEditorSelector";
import messages from "./Messages";
import "./ReviewTaskControls.scss";
import ErrorTagComment from "../ErrorTagComment/ErrorTagComment";

/**
 * ReviewTaskControls presents controls used to update the task review status.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ReviewTaskControls extends Component {
  constructor(props) {
    super(props);
    this.onConfirm = this.onConfirm.bind(this);
  }
  state = {
    comment: "",
    tags: null,
    loadBy: TaskReviewLoadMethod.next,
    errorTags: [],
  };

  setComment = (comment) => this.setState({ comment });
  setTags = (tags) => this.setState({ tags });

  onConfirm = (alternateCriteria) => {
    if (this.state.tags) {
      this.props.saveTaskTags(this.props.task, this.state.tags);
    }

    const history = _cloneDeep(this.props.history);
    _merge(history?.location?.state ?? {}, alternateCriteria);

    const requestedNextTask = !this.state.requestedNextTask
      ? null
      : {
          id: this.state.requestedNextTask,
          parent: this.state.requestedNextTaskParent,
        };

    const errorTags = this.state.errorTags?.length ? this.state.errorTags : undefined;

    this.props.updateTaskReviewStatus(
      this.props.task,
      this.state.reviewStatus,
      this.state.comment,
      null,
      this.state.loadBy,
      history,
      this.props.taskBundle,
      requestedNextTask,
      null,
      errorTags,
    );
    this.setState({ confirmingTask: false, comment: "", errorTags: [] });
  };

  handleChangeErrorTag = (e, i) => {
    const newTags = this.state.errorTags;
    newTags[i] = Number(e.target.value);
    this.setState({ errorTags: newTags });
  };

  handleAddErrorTag = () => {
    const newTags = this.state.errorTags;
    newTags.push(-1);
    this.setState({ errorTags: newTags });
  };

  handleRemoveErrorTag = (index) => {
    const newTags = this.state.errorTags;
    newTags.splice(index, 1);
    this.setState({ errorTags: newTags });
  };

  onCancel = () => {
    this.setState({ confirmingTask: false, errorTags: [] });
  };

  chooseLoadBy = (loadBy) => {
    this.setState({ loadBy });
  };

  chooseNextTask = (challengeId, isVirtual, taskId) => {
    this.setState({
      requestedNextTask: taskId,
      requestedNextTaskParent: challengeId,
    });
  };

  clearNextTask = () => {
    this.setState({ requestedNextTask: null });
  };

  /** Save Review Status */
  updateReviewStatus = (reviewStatus, type) => {
    if (type === "UPDATING_ERROR_TAGS") {
      this.setState({ errorTags: this.props.task.errorTags.split(",").map(Number) });
    }

    this.setState({ reviewStatus, confirmingTask: true, type });
  };

  /** Skip review of this task */
  skipReview = () => {
    this.props.skipTaskReview(
      this.props.task,
      this.state.loadBy,
      this.props.history,
      this.props.taskBundle,
    );
    this.setState({ confirmingTask: false, comment: "" });
  };

  /** Start Reviewing (claim this task) */
  startReviewing = () => {
    this.props.startReviewing(this.props.task);
  };

  /** Choose which editor to launch for fixing a task */
  pickEditor = ({ value }) => {
    const { task, taskFeatureProperties } = this.props;
    const comment = task.parent.checkinComment;
    const replacedComment = replacePropertyTags(comment, taskFeatureProperties, false);

    this.setState({ taskBeingCompleted: this.props.task.id });
    this.props.editTask(
      value,
      this.props.task,
      this.props.mapBounds,
      null,
      this.props.taskBundle,
      replacedComment,
    );
  };

  componentDidUpdate(prevProps) {
    const tagsArray = _map(this.props.task.tags, (tag) => tag.name);
    const filteredTagsArray = tagsArray.filter((tag) => tag !== "");
    const uniqueTagsArray = filteredTagsArray.filter(
      (value, index, self) => self.indexOf(value) === index,
    );
    const tags = uniqueTagsArray.join(",");

    if (tags.length > 0 && this.state.tags === null) {
      this.setState({ tags: tags });
    }

    if (prevProps.task.id !== this.props.task.id) {
      // Clear tags if we are on a new task
      this.setState({ tags: tags ?? null });
    }
  }

  render() {
    const user = this.props.user;

    // This task has not been completed yet.
    if (this.props.task.status === TaskStatus.created) {
      return (
        <div className="mr-text-white mr-text-md mr-mt-4 mr-mx-4">
          <FormattedMessage {...messages.taskNotCompleted} />
        </div>
      );
    }

    // The user is not a reviewer
    if (!user.settings.isReviewer) {
      return (
        <div className="mr-text-white mr-text-md mr-mt-4 mr-mx-4">
          <FormattedMessage {...messages.userNotReviewer} />
        </div>
      );
    }

    // Cannot review own task unless a superuser
    if (this.props.task.reviewRequestedBy === user.id && !user.isSuperUser) {
      return (
        <div className="mr-text-white mr-text-md mr-mt-4 mr-mx-4">
          <FormattedMessage {...messages.reviewerIsMapper} />
        </div>
      );
    }

    // A review has not been requested on this task.
    if (this.props.task.reviewStatus === undefined) {
      return (
        <div className="mr-text-white mr-text-md mr-mt-4 mr-mx-4">
          <FormattedMessage {...messages.reviewNotRequested} />
        </div>
      );
    }

    // This task has not been claimed yet for review.
    if (!this.props.task.reviewClaimedBy) {
      return (
        <div className={classNames("review-task-controls", this.props.className)}>
          <h5>
            <button
              className="mr-button mr-button--blue-fill mr-button--small mr-mb-2 mr-mr-2"
              style={{ minWidth: "12rem" }}
              onClick={() => this.startReviewing()}
            >
              <FormattedMessage {...messages.startReview} />
            </button>
          </h5>
        </div>
      );
    }

    // This task has been claimed by someone else.
    if (this.props.task.reviewClaimedBy !== user.id) {
      return (
        <div className={classNames("review-task-controls", this.props.className)}>
          <h5>
            <FormattedMessage {...messages.reviewAlreadyClaimed} />
          </h5>
        </div>
      );
    }

    const fromInbox = this.props.history?.location?.state?.fromInbox;
    const errorTags = this.props.task.errorTags;
    const isMetaReview = this.props.history?.location?.pathname?.includes("meta-review");
    const reviewData = this.props.task?.review;

    const isRevision =
      (!isMetaReview &&
        Boolean(reviewData?.reviewedBy) &&
        reviewData?.reviewStatus !== TaskReviewStatus.approved) ||
      (isMetaReview && Boolean(reviewData?.metaReviewedBy));

    return (
      <div className={classNames("review-task-controls", this.props.className)}>
        <div className="mr-text-sm mr-text-white mr-whitespace-nowrap">
          <FormattedMessage {...messages.currentTaskStatus} />
          <FormattedMessage {...messagesByStatus[this.props.task.status]} />
        </div>

        <div className="mr-text-sm mr-text-white mr-whitespace-nowrap">
          <FormattedMessage {...messages.currentReviewStatus} />
          <FormattedMessage {...messagesByReviewStatus[this.props.task.reviewStatus]} />
        </div>

        {isMetaReview && (
          <div className="mr-text-sm mr-text-white mr-whitespace-nowrap">
            <FormattedMessage {...messages.currentMetaReviewStatus} />
            {_isUndefined(this.props.task.metaReviewStatus) ? (
              <span />
            ) : (
              <FormattedMessage {...messagesByReviewStatus[this.props.task.metaReviewStatus]} />
            )}
          </div>
        )}
        <div className="mr-mt-2">
          <TaskTags
            user={this.props.user.id}
            task={this.props.task}
            tags={this.state.tags}
            setTags={this.setTags}
            onConfirm={this.onConfirm}
            saveTaskTags={this.props.saveTaskTags}
            taskReadOnly={this.props.taskReadOnly}
          />
        </div>

        {errorTags ? (
          <div className="mr-text-red">
            <FormattedMessage {...messages.errorTags} />: <ErrorTagComment errorTags={errorTags} />
          </div>
        ) : null}

        <div>
          <UserEditorSelector {...this.props} pickEditor={this.pickEditor} />
          <div className="mr-grid mr-grid-columns-2 mr-grid-gap-4">
            {this.props.task.metaReviewStatus === TaskReviewStatus.rejected && (
              <button
                className="mr-button mr-button--blue-fill mr-mb-2 mr-mr-2"
                style={{ minWidth: "12rem" }}
                onClick={() => this.updateReviewStatus(TaskReviewStatus.needed)}
              >
                <FormattedMessage {...messages.requestMetaReReview} />
              </button>
            )}
          </div>
        </div>

        {this.props.task.metaReviewStatus === TaskReviewStatus.rejected && (
          <div className="mr-my-4 mr-text-yellow mr-text-mango mr-text-lg">
            <FormattedMessage {...messages.changeReview} />
          </div>
        )}

        <div className="mr-mt-2 breadcrumb mr-w-full mr-flex mr-flex-wrap mr-m-auto">
          {isRevision ? (
            <button
              className="mr-button mr-button--blue-fill mr-mb-2 mr-mr-2"
              style={{ minWidth: "12rem" }}
              onClick={() => this.updateReviewStatus(TaskReviewStatus.approvedWithRevisions)}
            >
              <FormattedMessage {...messages.approvedWithRevisions} />
            </button>
          ) : (
            <button
              className="mr-button mr-button--blue-fill mr-mb-2 mr-mr-2"
              style={{ minWidth: "12rem" }}
              onClick={() => this.updateReviewStatus(TaskReviewStatus.approved)}
            >
              <FormattedMessage {...messages.approved} />
            </button>
          )}
          {(isRevision || isMetaReview) && errorTags ? (
            <button
              className="mr-button mr-button--blue-fill mr-mb-2 mr-mr-2"
              style={{ minWidth: "12rem" }}
              onClick={() =>
                this.updateReviewStatus(TaskReviewStatus.rejected, "UPDATING_ERROR_TAGS")
              }
            >
              <FormattedMessage {...messages.modify} />
            </button>
          ) : null}
          <button
            className="mr-button mr-button--blue-fill mr-mb-2 mr-mr-2"
            style={{ minWidth: "10rem" }}
            onClick={() => this.updateReviewStatus(TaskReviewStatus.rejected)}
          >
            <FormattedMessage {...messages.rejected} />
          </button>
          {isRevision ? (
            <button
              className="mr-button mr-button--blue-fill mr-mb-2 mr-mr-2"
              style={{ minWidth: "12rem" }}
              onClick={() =>
                this.updateReviewStatus(TaskReviewStatus.approvedWithFixesAfterRevisions)
              }
            >
              <FormattedMessage {...messages.approvedWithFixesAfterRevisions} />
            </button>
          ) : (
            <button
              className="mr-button mr-button--blue-fill mr-mb-2 mr-mr-2"
              style={{ minWidth: "12rem" }}
              onClick={() => this.updateReviewStatus(TaskReviewStatus.approvedWithFixes)}
            >
              <FormattedMessage {...messages.approvedWithFixes} />
            </button>
          )}
          <button
            className="mr-button mr-button--white mr-px-1 mr-mb-2 mr-mr-2"
            style={{ minWidth: "10rem" }}
            onClick={() => this.skipReview()}
          >
            {this.props.asMetaReview ? (
              <FormattedMessage {...messages.skipMetaReview} />
            ) : (
              <FormattedMessage {...messages.skipReview} />
            )}
          </button>
        </div>

        {this.state.confirmingTask && (
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
            isUpdatingErrorTags={this.state.type === "UPDATING_ERROR_TAGS"}
          />
        )}
      </div>
    );
  }
}

ReviewTaskControls.propTypes = {
  /** The task being reviewed */
  task: PropTypes.object,
};

export default WithSearch(
  WithTaskTags(WithEditor(WithKeyboardShortcuts(WithTaskFeatureProperties(ReviewTaskControls)))),
  "task",
);
