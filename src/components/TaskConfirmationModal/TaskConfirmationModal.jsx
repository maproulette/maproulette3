import classNames from "classnames";
import _cloneDeep from "lodash/cloneDeep";
import _filter from "lodash/filter";
import _isEmpty from "lodash/isEmpty";
import _kebabCase from "lodash/kebabCase";
import _merge from "lodash/merge";
import _noop from "lodash/noop";
import _split from "lodash/split";
import { Component, Fragment, createRef } from "react";
import { FormattedMessage } from "react-intl";
import AsCooperativeWork from "../../interactions/Task/AsCooperativeWork";
import {
  TaskLoadMethod,
  messagesByLoadMethod,
} from "../../services/Task/TaskLoadMethod/TaskLoadMethod";
import {
  TaskReviewLoadMethod,
  messagesByReviewLoadMethod,
} from "../../services/Task/TaskReview/TaskReviewLoadMethod";
import {
  keysByReviewStatus,
  messagesByReviewStatus,
} from "../../services/Task/TaskReview/TaskReviewStatus";
import { TaskReviewStatus } from "../../services/Task/TaskReview/TaskReviewStatus";
import {
  TaskStatus,
  keysByStatus,
  messagesByStatus,
} from "../../services/Task/TaskStatus/TaskStatus";
import { needsReviewType } from "../../services/User/User";
import BusySpinner from "../BusySpinner/BusySpinner";
import ErrorTagDropdown from "../ErrorTagDropdown/ErrorTagDropdown";
import External from "../External/External";
import KeywordAutosuggestInput from "../KeywordAutosuggestInput/KeywordAutosuggestInput";
import Modal from "../Modal/Modal";
import TaskCommentInput from "../TaskCommentInput/TaskCommentInput";
import TaskNearbyList from "../TaskPane/TaskNearbyList/TaskNearbyList";
import TaskReviewNearbyList from "../TaskPane/TaskNearbyList/TaskReviewNearbyList";
import AdjustFiltersOverlay from "./AdjustFiltersOverlay";
import InstructionsOverlay from "./InstructionsOverlay";
import messages from "./Messages";

const shortcutGroup = "taskConfirmation";

const ERROR_TAG_STATUSES = [
  TaskReviewStatus.rejected,
  TaskReviewStatus.approvedWithFixes,
  TaskReviewStatus.approvedWithFixesAfterRevisions,
];

export class TaskConfirmationModal extends Component {
  state = {
    criteria: {},
  };

  commentInputRef = createRef();

  handleKeyboardShortcuts = (event) => {
    // Ignore if shortcut group is not active
    if (_isEmpty(this.props.activeKeyboardShortcuts)) {
      return;
    }

    // Ignore if modifier keys were pressed
    if (event.metaKey || event.altKey || event.ctrlKey) {
      return;
    }

    if (
      event.key === this.props.keyboardShortcutGroups.taskConfirmation.confirmSubmit.key &&
      event.shiftKey
    ) {
      this.props.onConfirm(this.currentFilters());
      event.preventDefault();
    } else if (event.key === this.props.keyboardShortcutGroups.taskConfirmation.cancel.key) {
      this.props.onCancel();
      event.preventDefault();
    }
  };

  componentDidMount() {
    if (this.commentInputRef.current) {
      this.commentInputRef.current.focus();
    }

    this.props.pauseKeyboardShortcuts();
    this.props.activateKeyboardShortcut(
      shortcutGroup,
      this.props.keyboardShortcutGroups.taskConfirmation,
      this.handleKeyboardShortcuts,
    );

    if (
      this.props.needsResponses &&
      _isEmpty(this.props.completionResponses) &&
      this.props.status !== TaskStatus.skipped
    ) {
      this.setState({ showInstructions: true, instructionsContinue: true });
    }
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcut(
      shortcutGroup,
      "confirmSubmit",
      this.handleKeyboardShortcuts,
    );
    this.props.resumeKeyboardShortcuts();
  }

  handleAddTag = (value) => {
    this.props.setTags(!this.props.tags ? value : this.props.tags + "," + value);
  };

  handleChangeTags = (value) => {
    this.props.setTags(value);
  };

  filterChange = (key, value, invert = false) => {
    this.setState((prevState) => {
      const criteria = _cloneDeep(prevState.criteria);
      criteria.filters = criteria.filters || {};
      criteria.filters[key] = value;

      if (key === "challenge") {
        // If we are using a challenge filter then we need to cleanup
        // the challengeId filter as it gets priority.
        criteria.filters.challengeId = null;
      }

      criteria.invertFields = criteria.invertFields || {};
      criteria.invertFields[key] = invert;

      return { criteria };
    }, this.updateHistory);
  };

  updateHistory = () => {
    const { criteria } = this.state;
    const currentState = this.props.history?.location?.state ?? {};
    const newState = _merge({}, currentState, criteria);
    this.props.history.replace({
      ...this.props.history.location,
      state: newState,
    });
  };

  currentFilters = () => {
    return _merge({}, this.props.history?.location?.state ?? {}, this.state.criteria);
  };

  getHeaderMessage = (applyingTagChanges) => {
    if (this.props.isUpdatingErrorTags) {
      return <FormattedMessage {...messages.updateErrorTags} />;
    }

    if (this.props.inReview) {
      if (this.props.asMetaReview) {
        return <FormattedMessage {...messages.inMetaReviewHeader} />;
      }
      return <FormattedMessage {...messages.inReviewHeader} />;
    }

    if (this.props.needsRevised === undefined) {
      if (applyingTagChanges) {
        return <FormattedMessage {...messages.reviewChangesHeader} />;
      }
      return <FormattedMessage {...messages.header} />;
    }

    if (this.props.needsRevised === TaskReviewStatus.needed) {
      return <FormattedMessage {...messages.submitRevisionHeader} />;
    }

    return <FormattedMessage {...messages.disputeRevisionHeader} />;
  };

  render() {
    const reviewConfirmation = this.props.inReview || this.props.needsRevised !== undefined;
    const loadingNearby =
      this.props.loadBy === TaskLoadMethod.proximity ||
      this.props.loadBy === TaskReviewLoadMethod.nearby;
    const applyingTagChanges =
      AsCooperativeWork(this.props.task).isTagType() && this.props.status === TaskStatus.fixed;
    const preferredTags = !reviewConfirmation
      ? _filter(_split(this.props.task.parent?.preferredTags, ","), (result) => !_isEmpty(result))
      : _filter(
          _split(this.props.task.parent?.preferredReviewTags, ","),
          (result) => !_isEmpty(result),
        );

    const limitTags = !reviewConfirmation
      ? !!this.props.task.parent?.limitTags
      : !!this.props.task.parent?.limitReviewTags;

    const TasksNearby = reviewConfirmation ? TaskReviewNearbyList : TaskNearbyList;
    const disabled = this.props.disabled || this.props.isCompleting;

    return (
      <External>
        <Modal
          contentClassName="mr-pb-6"
          fullScreen={loadingNearby}
          narrow={!loadingNearby}
          medium={reviewConfirmation && !loadingNearby}
          isActive
          allowOverflow
          onClose={this.props.onCancel}
        >
          <div className={loadingNearby ? "mr-flex mr-h-full" : ""}>
            <div
              className={classNames(
                "mr-flex",
                { "mr-pr-12": loadingNearby },
                { "mr-justify-center": !loadingNearby },
              )}
            >
              <div className={classNames("mr-flex mr-flex-col mr-items-center")}>
                <div className="mr-w-full">
                  <h2 className="mr-text-grey-light-more mr-text-4xl mr-mt-4">
                    {this.getHeaderMessage(applyingTagChanges)}
                  </h2>
                  {this.props.inReview && !this.props.isUpdatingErrorTags && (
                    <div
                      className={classNames(
                        "mr-uppercase mr-tracking-wide",
                        `mr-status-${_kebabCase(keysByReviewStatus[this.props.status])}`,
                      )}
                    >
                      {this.props.status === TaskReviewStatus.needed ? (
                        <FormattedMessage {...messages.metaReviewRequestedLabel} />
                      ) : (
                        <FormattedMessage {...messagesByReviewStatus[this.props.status]} />
                      )}
                    </div>
                  )}
                  {!this.props.inReview && !applyingTagChanges && (
                    <div
                      className={classNames(
                        "mr-uppercase mr-tracking-wide",
                        `mr-status-${_kebabCase(keysByStatus[this.props.status])}`,
                      )}
                    >
                      <FormattedMessage {...messagesByStatus[this.props.status]} />
                    </div>
                  )}

                  {applyingTagChanges && (
                    <Fragment>
                      <div className="mr-border mr-border-gray-300 mr-shadow-md mr-p-4 mr-mt-4">
                        <p className="mr-mb-2 mr-text-white mr-font-bold mr-bg-blue-600 mr-rounded">
                          <FormattedMessage {...messages.osmUploadNotice} />
                        </p>
                        <div className="mr-text-base mr-mt-2 mr-text-yellow">
                          <FormattedMessage {...messages.osmCommentHeader} />
                        </div>

                        <div>
                          <textarea
                            ref={this.commentInputRef}
                            className="mr-input mr-text-white mr-placeholder-medium mr-bg-grey-lighter-10 mr-border-none mr-shadow-inner mr-p-3 mr-my-1"
                            rows={2}
                            value={this.props.osmComment}
                            onChange={(e) => this.props.setOSMComment(e.target.value)}
                          />
                        </div>

                        <div className="mr-bg-blue-dark shadow-md">
                          <div className="mr-flex mr-justify-between">
                            <table className="mr-w-full mr-px-2 mr-border mr-border-gray-300 mr-shadow-sm">
                              <thead>
                                <tr>
                                  <th
                                    className="mr-font-bold mr-py-1 mr-text-sm mr-border mr-border-gray-300 text-center"
                                    style={{ width: "33%" }}
                                  >
                                    <FormattedMessage {...messages.tagNameLabel} />
                                  </th>
                                  <th
                                    className="mr-font-bold mr-py-1 mr-text-sm mr-border mr-border-gray-300 text-center"
                                    style={{ width: "33%" }}
                                  >
                                    <FormattedMessage {...messages.oldValueLabel} />
                                  </th>
                                  <th
                                    className="mr-font-bold mr-py-1 mr-text-sm mr-border mr-border-gray-300 text-center"
                                    style={{ width: "33%" }}
                                  >
                                    <FormattedMessage {...messages.newValueLabel} />
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.props.tagDiffs?.[0] &&
                                  Object.keys(this.props.tagDiffs?.[0]).map((tagName) => {
                                    const tagChange = (this.props.tagDiffs?.[0])[tagName];
                                    if (
                                      ["changed", "removed", "added"].includes(tagChange.status)
                                    ) {
                                      return (
                                        <tr
                                          key={tagName}
                                          className={classNames("mr-mb-2  mr-rounded", {
                                            "mr-text-orange": tagChange.status === "changed",
                                            "mr-text-lavender-rose": tagChange.status === "removed",
                                            "mr-text-picton-blue": tagChange.status === "added",
                                          })}
                                        >
                                          <td
                                            className="mr-border mr-border-gray-300 mr-text-center"
                                            style={{ width: "33%" }}
                                          >
                                            <strong>{tagName}</strong>
                                          </td>
                                          <td
                                            className="mr-border mr-border-gray-300 mr-text-center mr-text-red-light"
                                            style={{ width: "33%" }}
                                          >
                                            {tagChange.value || "—"}
                                          </td>
                                          <td
                                            className="mr-border mr-border-gray-300 mr-text-center mr-text-green-lighter"
                                            style={{ width: "33%" }}
                                          >
                                            <span className="mr-font-semibold">
                                              {tagChange.newValue || "—"}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    }
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </Fragment>
                  )}
                  {applyingTagChanges && (
                    <div className="mr-text-base mr-mt-4 mr-text-yellow">
                      <FormattedMessage {...messages.mrCommentHeader} />
                    </div>
                  )}
                  <div className={classNames({ "mr-mt-2": !applyingTagChanges })}>
                    <div className={applyingTagChanges ? "mr-mt-1" : "mr-mt-6"}>
                      <TaskCommentInput
                        inputRef={this.commentInputRef}
                        inputClassName="mr-appearance-none mr-outline-none mr-input mr-text-white mr-placeholder-medium mr-bg-grey-lighter-10 mr-border-none mr-shadow-inner mr-p-3 mr-font-mono mr-text-sm"
                        previewClassName="mr-border-2 mr-rounded mr-border-grey-lighter-10 mr-p-2 mr-max-h-48 mr-overflow-y-scroll"
                        rows={applyingTagChanges ? 2 : 4}
                        placeholder={
                          applyingTagChanges
                            ? ""
                            : this.props.intl.formatMessage(messages.placeholder)
                        }
                        value={this.props.comment}
                        commentChanged={this.props.setComment}
                        taskId={this.props.task.id}
                      />
                    </div>
                    <KeywordAutosuggestInput
                      handleChangeTags={this.handleChangeTags}
                      handleAddTag={this.handleAddTag}
                      formData={this.props.tags}
                      {...this.props}
                      tagType={"tasks"}
                      preferredResults={preferredTags}
                      limitToPreferred={limitTags}
                      placeholder={this.props.intl.formatMessage(messages.addTagsPlaceholder)}
                    />

                    {this.props.submitComment && (
                      <div className="mr-my-1 mr-flex mr-justify-end">
                        <button
                          className="mr-button mr-button--link"
                          onClick={this.props.submitComment}
                        >
                          <FormattedMessage {...messages.submitCommentLabel} />
                        </button>
                      </div>
                    )}
                  </div>
                  {ERROR_TAG_STATUSES.includes(this.props.status) &&
                    this.props.history.location.pathname.includes("review") && (
                      <ErrorTagDropdown
                        onChange={this.props.onChangeErrorTag}
                        errorTags={this.props.errorTags}
                        addErrorTag={this.props.addErrorTag}
                        removeErrorTag={this.props.removeErrorTag}
                      />
                    )}
                  {this.props.status !== TaskStatus.skipped &&
                    !reviewConfirmation &&
                    this.props.user.settings.needsReview !== needsReviewType.mandatory && (
                      <div className="form mr-flex mr-items-baseline">
                        <input
                          id="review-input"
                          type="checkbox"
                          className="mr-mr-2"
                          checked={this.props.needsReview}
                          onClick={this.props.toggleNeedsReview}
                          onChange={_noop}
                        />
                        <label htmlFor="review-input" className="mr-text-white-50">
                          <FormattedMessage {...messages.reviewLabel} />
                        </label>
                      </div>
                    )}

                  <div className="mr-flex mr-items-center mr-mt-6">
                    <button
                      className="mr-button mr-button--white mr-mr-12 mr-px-8"
                      onClick={this.props.onCancel}
                      disabled={disabled}
                    >
                      <FormattedMessage {...messages.cancelLabel} />
                    </button>

                    <button
                      className="mr-button mr-px-8"
                      onClick={() => this.props.onConfirm(this.currentFilters())}
                      disabled={disabled}
                    >
                      {this.props.isCompleting ? (
                        <BusySpinner inline />
                      ) : (
                        <FormattedMessage {...messages.submitLabel} />
                      )}
                    </button>
                  </div>

                  {!reviewConfirmation && (
                    <div className="mr-mt-8">
                      <div className="form">
                        <span className="mr-mr-4">
                          <FormattedMessage {...messages.loadByLabel} />
                        </span>
                        <input
                          id="load-method-random-input"
                          type="radio"
                          name="randomnessPreference"
                          className="mr-radio mr-mr-1"
                          checked={this.props.loadBy === TaskLoadMethod.random}
                          onClick={() => this.props.chooseLoadBy(TaskLoadMethod.random)}
                          onChange={_noop}
                          disabled={disabled}
                        />
                        <label htmlFor="load-method-random-input" className="mr-ml-1 mr-mr-4">
                          <FormattedMessage {...messagesByLoadMethod[TaskLoadMethod.random]} />
                        </label>

                        <input
                          id="load-method-proximity-input"
                          type="radio"
                          name="randomnessPreference"
                          className="mr-radio mr-mr-1"
                          checked={this.props.loadBy === TaskLoadMethod.proximity}
                          onClick={() => this.props.chooseLoadBy(TaskLoadMethod.proximity)}
                          onChange={_noop}
                          disabled={disabled}
                        />
                        <label htmlFor="load-method-proximity-input" className="mr-ml-1">
                          <FormattedMessage {...messagesByLoadMethod[TaskLoadMethod.proximity]} />
                        </label>
                      </div>
                      <div className="mr-text-green-lighter mr-text-center mr-mt-4 hover:mr-text-white mr-cursor-pointer mr-text-xs">
                        <div
                          onClick={() =>
                            this.setState({
                              showInstructions: true,
                              instructionsContinue: false,
                            })
                          }
                        >
                          <FormattedMessage {...messages.viewInstructions} />
                        </div>
                      </div>
                    </div>
                  )}

                  {reviewConfirmation && this.props.needsRevised === undefined && (
                    <Fragment>
                      <div className="mr-mt-8 mr-text-sm">
                        <div className="mr-mr-4">
                          <FormattedMessage {...messages.loadNextReviewLabel} />
                        </div>
                        <div className="mr-flex mr-flex-wrap mr-mt-2">
                          <div className="mr-mr-4">
                            <input
                              type="radio"
                              name="loadReviewPreference"
                              className="mr-mr-2"
                              checked={this.props.loadBy === TaskReviewLoadMethod.next}
                              onClick={() => this.props.chooseLoadBy(TaskReviewLoadMethod.next)}
                              onChange={_noop}
                              disabled={disabled}
                            />
                            <label>
                              <FormattedMessage
                                {...messagesByReviewLoadMethod[TaskReviewLoadMethod.next]}
                              />
                            </label>
                          </div>
                          <div className="mr-mr-4">
                            <input
                              type="radio"
                              name="loadReviewPreference"
                              className="mr-mr-2"
                              checked={this.props.loadBy === TaskReviewLoadMethod.nearby}
                              onClick={() => this.props.chooseLoadBy(TaskReviewLoadMethod.nearby)}
                              onChange={_noop}
                              disabled={disabled}
                            />
                            <label>
                              <FormattedMessage
                                {...messagesByReviewLoadMethod[TaskReviewLoadMethod.nearby]}
                              />
                            </label>
                          </div>
                          {this.props.fromInbox && (
                            <div className="mr-mr-4">
                              <input
                                type="radio"
                                name="loadReviewPreference"
                                className="mr-mr-2"
                                checked={this.props.loadBy === TaskReviewLoadMethod.inbox}
                                onClick={() => this.props.chooseLoadBy(TaskReviewLoadMethod.inbox)}
                                onChange={_noop}
                                disabled={disabled}
                              />
                              <label>
                                <FormattedMessage
                                  {...messagesByReviewLoadMethod[TaskReviewLoadMethod.inbox]}
                                />
                              </label>
                            </div>
                          )}
                          <div>
                            <input
                              type="radio"
                              name="loadReviewPreference"
                              className="mr-mr-2"
                              checked={this.props.loadBy === TaskReviewLoadMethod.all}
                              onClick={() => this.props.chooseLoadBy(TaskReviewLoadMethod.all)}
                              onChange={_noop}
                              disabled={disabled}
                            />
                            <label>
                              <FormattedMessage
                                {...messagesByReviewLoadMethod[TaskReviewLoadMethod.all]}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="mr-text-green-lighter mr-text-center mr-mt-4 hover:mr-text-white mr-cursor-pointer">
                        <div onClick={() => this.setState({ showReviewFilters: true })}>
                          <FormattedMessage {...messages.adjustFilters} />
                        </div>
                      </div>
                    </Fragment>
                  )}

                  {reviewConfirmation &&
                    this.props.needsRevised !== undefined &&
                    this.props.fromInbox && (
                      <div className="form mr-mt-8">
                        <span className="mr-mr-4">
                          <FormattedMessage {...messages.loadNextReviewLabel} />
                        </span>
                        <input
                          type="radio"
                          name="loadReviewPreference"
                          className="mr-mr-2"
                          checked={this.props.loadBy === TaskReviewLoadMethod.inbox}
                          onClick={() => this.props.chooseLoadBy(TaskReviewLoadMethod.inbox)}
                          onChange={_noop}
                          disabled={disabled}
                        />
                        <label htmlFor="review-load-method-input" className="mr-mr-4">
                          <FormattedMessage
                            {...messagesByReviewLoadMethod[TaskReviewLoadMethod.inbox]}
                          />
                        </label>
                        <input
                          id="review-load-method-input"
                          type="radio"
                          name="loadReviewPreference"
                          className="mr-mr-2"
                          checked={this.props.loadBy === TaskReviewLoadMethod.all}
                          onClick={() => this.props.chooseLoadBy(TaskReviewLoadMethod.all)}
                          onChange={_noop}
                          disabled={disabled}
                        />
                        <label>
                          <FormattedMessage
                            {...messagesByReviewLoadMethod[TaskReviewLoadMethod.all]}
                          />
                        </label>
                      </div>
                    )}
                </div>
              </div>
            </div>
            {loadingNearby && (
              <div className="mr-w-full mr-h-full mr-flex mr-flex-col">
                <h4 className="mr-my-6 mr-text-yellow mr-pl-12">
                  <FormattedMessage {...messages.nextNearbyLabel} />
                </h4>
                <div className="mr-border-l-2 mr-border-grey-lighter-10 mr-pl-12 mr-flex-grow">
                  <div className="mr-h-full mr-w-full">
                    <TasksNearby
                      {...this.props}
                      onTaskClick={this.props.chooseNextTask}
                      onMapClick={this.props.clearNextTask}
                      currentFilters={this.currentFilters()}
                      excludeSelfLockedTasks
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {this.props.inReview && this.state.showReviewFilters && (
            <AdjustFiltersOverlay
              {...this.props}
              close={() => this.setState({ showReviewFilters: false })}
              filterChange={this.filterChange}
              currentFilters={this.currentFilters()}
            />
          )}
          {!this.props.inReview &&
            this.state.showInstructions &&
            this.props.needsRevised === undefined && (
              <InstructionsOverlay
                {...this.props}
                close={() =>
                  this.setState({
                    showInstructions: false,
                    instructionsContinue: false,
                  })
                }
                closeMessage={
                  this.state.instructionsContinue
                    ? messages.instructionsContinueLabel
                    : messages.closeInstructionsLabel
                }
              />
            )}
        </Modal>
      </External>
    );
  }
}

export default TaskConfirmationModal;
