import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { TaskStatus } from "../../../../../services/Task/TaskStatus/TaskStatus";
import UserEditorSelector from "../../../../UserEditorSelector/UserEditorSelector";
import TaskAlreadyFixedControl from "../TaskAlreadyFixedControl/TaskAlreadyFixedControl";
import TaskFalsePositiveControl from "../TaskFalsePositiveControl/TaskFalsePositiveControl";
import TaskFixedControl from "../TaskFixedControl/TaskFixedControl";
import TaskRevisedControl from "../TaskRevisedControl/TaskRevisedControl";
import TaskSkipControl from "../TaskSkipControl/TaskSkipControl";
import TaskTooHardControl from "../TaskTooHardControl/TaskTooHardControl";
import "./TaskCompletionStep.scss";
import ErrorTagComment from "../../../../ErrorTagComment/ErrorTagComment";
import messages from "./Messages";

/**
 * TaskCompletionStep renders and manages controls and keyboard shortcuts for
 * initiating editing a task (fix, skip, false positive).
 *
 * @see See ActiveTaskControls
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskCompletionStep extends Component {
  state = {
    moreOptionsOpen: false,
  };

  render() {
    return (
      <div className="mr-items-center mr-justify-center">
        {this.props.needsRevised && (
          <div
            className={`${this.props.task?.errorTags ? "mr-text-red" : "mr-text-white"} mr-text-md`}
          >
            <div>
              <FormattedMessage {...messages.revisionNeeded} />{" "}
              {this.props.task?.errorTags ? (
                <>
                  <FormattedMessage {...messages.errorTagsApplied} />:{" "}
                  <ErrorTagComment errorTags={this.props.task.errorTags} />{" "}
                </>
              ) : (
                ""
              )}
              <FormattedMessage {...messages.checkComments} />
            </div>
          </div>
        )}

        <UserEditorSelector {...this.props} className="mr-mb-2" />
        <div className="breadcrumb mr-w-full mr-flex mr-flex-wrap mr-m-auto mr-items-center">
          {this.props.needsRevised && (
            <div className="mr-mt-2">
              <TaskRevisedControl {...this.props} />
            </div>
          )}
          <div className="mr-mt-2">
            {this.props.allowedProgressions.has(TaskStatus.fixed) && (
              <TaskFixedControl {...this.props} />
            )}

            {this.props.allowedProgressions.has(TaskStatus.alreadyFixed) && (
              <TaskAlreadyFixedControl {...this.props} />
            )}

            {this.props.allowedProgressions.has(TaskStatus.falsePositive) && (
              <TaskFalsePositiveControl {...this.props} />
            )}

            {this.props.allowedProgressions.has(TaskStatus.tooHard) && (
              <TaskTooHardControl {...this.props} />
            )}

            {this.props.allowedProgressions.has(TaskStatus.skipped) && !this.props.needsRevised && (
              <TaskSkipControl {...this.props} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

TaskCompletionStep.propTypes = {
  /** The current active task */
  task: PropTypes.object.isRequired,
  /** The current map bounds (for editing) */
  mapBounds: PropTypes.object,
  /** Invoked if the user wishes to edit the task */
  pickEditor: PropTypes.func.isRequired,
  /** Invoked if the user immediately completes the task (false positive) */
  complete: PropTypes.func.isRequired,
};
