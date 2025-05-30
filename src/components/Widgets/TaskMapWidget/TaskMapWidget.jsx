import { Component } from "react";
import { FormattedMessage } from "react-intl";
import AsCooperativeWork from "../../../interactions/Task/AsCooperativeWork";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import MapPane from "../../EnhancedMap/MapPane/MapPane";
import WithKeyboardShortcuts from "../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts";
import QuickWidget from "../../QuickWidget/QuickWidget";
import TaskMap from "../../TaskPane/TaskMap/TaskMap";
import messages from "./Messages";
import EditSwitch from "./RapidEditor/EditSwitch";
import RapidEditor from "./RapidEditor/RapidEditor";

const descriptor = {
  widgetKey: "TaskMapWidget",
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 9,
  minHeight: 5,
  defaultHeight: 19,
};

export default class TaskMapWidget extends Component {
  componentWillUnmount = () => {
    this.props.resumeKeyboardShortcuts();
  };

  componentDidUpdate(prevProps) {
    const prevEditMode = prevProps.getUserAppSetting
      ? prevProps.getUserAppSetting(prevProps.user, "isEditMode")
      : false;
    const currentEditMode = this.props.getUserAppSetting
      ? this.props.getUserAppSetting(this.props.user, "isEditMode")
      : false;

    if (currentEditMode !== prevEditMode) {
      currentEditMode ? this.props.pauseKeyboardShortcuts() : this.props.resumeKeyboardShortcuts();
    }
  }

  render() {
    const cooperative =
      AsCooperativeWork(this.props.task).isTagType() || this.props.task.cooperativeWork;
    const isReviewing =
      this.props.task?.reviewClaimedBy === this.props.user?.id &&
      this.props.task?.reviewStatus === 0;
    const disableRapid =
      cooperative ||
      this.props.taskReadOnly ||
      (![0, 3, 6].includes(this.props.task?.status) &&
        ![2, 4, 5].includes(this.props.task?.reviewStatus) &&
        !isReviewing &&
        !this.props.asMetaReview);

    const editMode = disableRapid
      ? false
      : this.props.getUserAppSetting
        ? this.props.getUserAppSetting(this.props.user, "isEditMode")
        : false;

    if (!this.props.task.geometries.features) {
      return (
        <QuickWidget {...this.props} className="task-map-widget" noMain permanent>
          <div className="mr-text-lg mr-text-red-light mr-flex">
            <FormattedMessage {...messages.rapidFailed} />
          </div>
        </QuickWidget>
      );
    }

    const altWorkspaceType =
      this.props.currentConfiguration?.type === "leftPanel" ||
      this.props.currentConfiguration?.type === "rightPanel";

    return (
      <QuickWidget {...this.props} className="task-map-widget" noMain permanent>
        <div
          className="mr-mt-2"
          style={{ height: altWorkspaceType ? "calc(100vh - 270px)" : "calc(100% - 3rem)" }}
        >
          {this.props.getUserAppSetting ? (
            <>
              <div className="mr-flex mr-items-center ">
                <div className="mr-text-yellow mr-mr-1 mr-mt-1 mr-mb-2">
                  <FormattedMessage {...messages.editMode} />
                </div>
                <div className="mr-mt-1 mr-mb-2">
                  <EditSwitch {...this.props} disableRapid={disableRapid} editMode={editMode} />
                </div>
              </div>
            </>
          ) : null}
          {editMode ? (
            <RapidEditor
              token={this.props.user.osmProfile.requestToken}
              task={this.props.task}
              comment={this.props.task?.parent?.checkinComment ?? "#mapRoulette"}
              configurationType={this.props.currentConfiguration?.type}
            />
          ) : (
            <MapPane {...this.props}>
              <TaskMap {...this.props} challenge={this.props.task.parent} />
            </MapPane>
          )}
        </div>
      </QuickWidget>
    );
  }
}

registerWidgetType(WithKeyboardShortcuts(TaskMapWidget), descriptor);
