import PropTypes from "prop-types";
import { Component } from "react";
import { TaskStatus } from "../../../../../services/Task/TaskStatus/TaskStatus";
import UserEditorSelector from "../../../../UserEditorSelector/UserEditorSelector";
import TaskAlreadyFixedControl from "../TaskAlreadyFixedControl/TaskAlreadyFixedControl";
import TaskFalsePositiveControl from "../TaskFalsePositiveControl/TaskFalsePositiveControl";
import TaskFixedControl from "../TaskFixedControl/TaskFixedControl";
import TaskSkipControl from "../TaskSkipControl/TaskSkipControl";
import TaskTooHardControl from "../TaskTooHardControl/TaskTooHardControl";
import "./TaskCompletionStep.scss";

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
      <div className="mr-my-4">
        <div className="mr-mb-4">
          {!this.props.editMode && (
            <UserEditorSelector
              {...this.props}
              className="mr-mb-4"
              onChange={this.props.pickEditor}
            />
          )}

          <div className="mr-mt-2">
            {this.props.allowedProgressions.has(TaskStatus.fixed) && (
              <TaskFixedControl
                {...this.props}
                disabled={this.props.disabled || this.state.isCompleting || this.props.isCompleting}
              />
            )}

            {this.props.allowedProgressions.has(TaskStatus.alreadyFixed) && (
              <TaskAlreadyFixedControl
                {...this.props}
                disabled={this.props.disabled || this.state.isCompleting || this.props.isCompleting}
              />
            )}

            {this.props.allowedProgressions.has(TaskStatus.falsePositive) && (
              <TaskFalsePositiveControl
                {...this.props}
                disabled={this.props.disabled || this.state.isCompleting || this.props.isCompleting}
              />
            )}

            {this.props.allowedProgressions.has(TaskStatus.tooHard) && (
              <TaskTooHardControl
                {...this.props}
                disabled={this.props.disabled || this.state.isCompleting || this.props.isCompleting}
              />
            )}

            {this.props.allowedProgressions.has(TaskStatus.skipped) && !this.props.needsRevised && (
              <TaskSkipControl
                {...this.props}
                disabled={this.props.disabled || this.state.isCompleting || this.props.isCompleting}
              />
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
  /** Whether the task completion step is disabled */
  disabled: PropTypes.bool,
};
