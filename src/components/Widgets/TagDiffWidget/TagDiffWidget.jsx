import { Component } from "react";
import { FormattedMessage } from "react-intl";
import AsCooperativeWork from "../../../interactions/Task/AsCooperativeWork";
import { TaskReviewStatus } from "../../../services/Task/TaskReview/TaskReviewStatus";
import { isFinalStatus } from "../../../services/Task/TaskStatus/TaskStatus";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import BusySpinner from "../../BusySpinner/BusySpinner";
import QuickWidget from "../../QuickWidget/QuickWidget";
import TagDiffModal from "../../TagDiffVisualization/TagDiffModal";
import TagDiffVisualization from "../../TagDiffVisualization/TagDiffVisualization";
import messages from "./Messages";

const descriptor = {
  widgetKey: "TagDiffWidget",
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 8,
  minHeight: 4,
  defaultHeight: 5,
};

export default class TagDiffWidget extends Component {
  state = {
    showDiffModal: false,
  };

  render() {
    const editEnabled =
      this.props.task.reviewStatus !== TaskReviewStatus.rejected &&
      !isFinalStatus(this.props.task.status);
    return (
      <QuickWidget
        {...this.props}
        className="mr-bg-transparent"
        noMain
        permanent
        widgetTitle={<FormattedMessage {...messages.title} />}
        rightHeaderControls={
          <div className="mr-flex">
            <button
              className="mr-button mr-button--xsmall mr-mr-4"
              onClick={() => this.setState({ showDiffModal: true })}
            >
              <FormattedMessage {...messages.viewAllTagsLabel} />
            </button>
            {this.props.user.settings.seeTagFixSuggestions && editEnabled ? (
              <div className="mr-flex">
                <button
                  className="mr-button mr-button--xsmall"
                  onClick={() => this.setState({ showDiffModal: true, editMode: true })}
                >
                  <FormattedMessage {...messages.editTagsLabel} />
                </button>
              </div>
            ) : null}
          </div>
        }
      >
        <TagDiff {...this.props} />

        {this.state.showDiffModal && (
          <TagDiffModal
            {...this.props}
            editMode={this.state.editMode}
            editEnabled={editEnabled}
            onClose={() => this.setState({ showDiffModal: false, editMode: false })}
          />
        )}
      </QuickWidget>
    );
  }
}

export const TagDiff = (props) => {
  if (!props.user.settings.seeTagFixSuggestions) {
    return (
      <div className="mr-mb-4">
        <FormattedMessage {...messages.disabledDescription} />
      </div>
    );
  }

  if (props.loadingOSMData) {
    return (
      <div className="mr-mb-4">
        <BusySpinner />
      </div>
    );
  }

  return (
    <div className="mr-mb-4">
      <TagDiffVisualization
        {...props}
        compact
        suppressToolbar
        onlyChanges
        tagDiff={props.tagDiffs?.[0]}
      />
    </div>
  );
};

/**
 * Allow this widget to be treated as a conditional widget, returning true or
 * false as to whether it should be hidden given the current workspace props
 */
TagDiffWidget.hideWidget = function (props) {
  return props.task && !AsCooperativeWork(props.task).isTagType();
};

registerWidgetType(TagDiffWidget, descriptor);
