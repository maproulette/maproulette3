import { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { TaskStatus } from "../../../../../services/Task/TaskStatus/TaskStatus";
import BusySpinner from "../../../../BusySpinner/BusySpinner";
import WithKeyboardShortcuts from "../../../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts";
import WithSearch from "../../../../HOCs/WithSearch/WithSearch";
import WithTaskReview from "../../../../HOCs/WithTaskReview/WithTaskReview";
import WithTaskTags from "../../../../HOCs/WithTaskTags/WithTaskTags";
import TaskAlreadyFixedControl from "../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskAlreadyFixedControl/TaskAlreadyFixedControl";
import TaskFalsePositiveControl from "../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskFalsePositiveControl/TaskFalsePositiveControl";
import TaskFixedControl from "../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskFixedControl/TaskFixedControl";
import TaskSkipControl from "../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskSkipControl/TaskSkipControl";
import TaskTooHardControl from "../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskTooHardControl/TaskTooHardControl";
import UserEditorSelector from "../../../../UserEditorSelector/UserEditorSelector";
import messages from "./Messages";

export class CooperativeWorkControls extends Component {
  state = {
    showDiffModal: false,
  };

  render() {
    const disabled = this.props.disabled || this.props.isCompleting;
    if (!this.props.task) {
      return null;
    }

    return (
      <div className="mr-pb-2">
        {this.props.loadingOSMData && <BusySpinner />}
        <UserEditorSelector {...this.props} className="mr-mb-4" disabled={disabled} />
        <p className="mr-text-md mr-mb-2 mr-mt-2">
          <FormattedMessage {...messages.prompt} />
        </p>
        <div className="mr-mt-2 breadcrumb mr-w-full mr-flex mr-flex-wrap mr-m-auto">
          {this.props.allowedProgressions.has(TaskStatus.fixed) && (
            <TaskFixedControl
              {...this.props}
              fixedLabel={<FormattedMessage {...messages.confirmLabel} />}
              disabled={disabled}
            />
          )}

          {this.props.allowedProgressions.has(TaskStatus.falsePositive) && (
            <TaskFalsePositiveControl
              {...this.props}
              falsePositiveLabel={<FormattedMessage {...messages.rejectLabel} />}
              disabled={disabled}
            />
          )}
        </div>
        <div className="mr-mt-2 breadcrumb mr-w-full mr-flex mr-flex-wrap mr-m-auto">
          {this.props.allowedProgressions.has(TaskStatus.alreadyFixed) && (
            <TaskAlreadyFixedControl {...this.props} disabled={disabled} />
          )}
          {this.props.allowedProgressions.has(TaskStatus.tooHard) && (
            <TaskTooHardControl {...this.props} disabled={disabled} />
          )}
          {this.props.allowedProgressions.has(TaskStatus.skipped) && (
            <TaskSkipControl {...this.props} disabled={disabled} />
          )}
        </div>
      </div>
    );
  }
}

export default WithSearch(
  WithTaskTags(WithTaskReview(WithKeyboardShortcuts(injectIntl(CooperativeWorkControls)))),
  "task",
);
