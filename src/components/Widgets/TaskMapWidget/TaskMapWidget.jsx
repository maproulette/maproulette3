import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { replacePropertyTags } from "../../../hooks/UsePropertyReplacement/UsePropertyReplacement";
import AsCooperativeWork from "../../../interactions/Task/AsCooperativeWork";
import { Editor } from "../../../services/Editor/Editor";
import { OPEN_STREET_MAP } from "../../../services/VisibleLayer/LayerSources";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import MapPane from "../../EnhancedMap/MapPane/MapPane";
import WithEditor from "../../HOCs/WithEditor/WithEditor";
import WithKeyboardShortcuts from "../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts";
import QuickWidget from "../../QuickWidget/QuickWidget";
import TaskMap from "../../TaskPane/TaskMap/TaskMap";
import UserEditorSelector from "../../UserEditorSelector/UserEditorSelector";
import messages from "./Messages";
import RapidEditor from "./RapidEditor/RapidEditor";

const TAB_VIEW = "view";
const TAB_EDIT = "edit";

const descriptor = {
  widgetKey: "TaskMapWidget",
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 9,
  minHeight: 5,
  defaultHeight: 19,
};

const getActiveTab = (props, disableRapid) => {
  if (!props.getUserAppSetting) return TAB_VIEW;

  const mapTab = props.getUserAppSetting(props.user, "mapTab");
  if (mapTab) {
    // If editing is disabled, force view tab
    if (disableRapid && mapTab !== TAB_VIEW) return TAB_VIEW;
    return mapTab;
  }

  // Backward compatibility: migrate from isEditMode boolean
  const isEditMode = props.getUserAppSetting(props.user, "isEditMode");
  if (isEditMode && !disableRapid) return TAB_EDIT;
  return TAB_VIEW;
};

export default class TaskMapWidget extends Component {
  componentWillUnmount = () => {
    this.props.resumeKeyboardShortcuts();
  };

  componentDidUpdate(prevProps) {
    const prevTab = getActiveTab(prevProps, false);
    const currentTab = getActiveTab(this.props, false);

    if (currentTab !== prevTab) {
      currentTab === TAB_EDIT
        ? this.props.pauseKeyboardShortcuts()
        : this.props.resumeKeyboardShortcuts();
    }
  }

  setTab = (tab) => {
    if (this.props.updateUserAppSetting) {
      this.props.updateUserAppSetting(this.props.user.id, { mapTab: tab });
    }
  };

  pickEditor = ({ value }) => {
    const { task, taskFeatureProperties } = this.props;
    const comment = task.parent?.checkinComment;
    const replacedComment = replacePropertyTags(comment, taskFeatureProperties, false);

    this.props.editTask(
      value,
      task,
      this.props.mapBounds,
      {
        imagery: this.props.source?.id !== OPEN_STREET_MAP ? this.props.source : undefined,
        photoOverlay: this.props.showMapillaryLayer ? "mapillary" : null,
      },
      this.props.taskBundle,
      replacedComment,
    );
  };

  allowedEditors = () => {
    return AsCooperativeWork(this.props.task).isChangeFileType()
      ? [Editor.josmLayer, Editor.josm]
      : null;
  };

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

    const activeTab = getActiveTab(this.props, disableRapid);

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

    const tabs = [
      { key: TAB_VIEW, label: messages.viewTab, disabled: false },
      { key: TAB_EDIT, label: messages.editTab, disabled: disableRapid },
    ];

    return (
      <QuickWidget {...this.props} className="task-map-widget" noMain permanent>
        <div
          className="mr-mt-2"
          style={{ height: altWorkspaceType ? "calc(100vh - 270px)" : "calc(100% - 3rem)" }}
        >
          {this.props.getUserAppSetting ? (
            <div className="mr-flex mr-items-center mr-mb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`mr-px-3 mr-py-1 mr-text-sm mr-font-medium mr-border-b-2 mr-mr-2 ${
                    activeTab === tab.key
                      ? "mr-border-green-light mr-text-green-light"
                      : tab.disabled
                        ? "mr-border-transparent mr-text-grey mr-cursor-not-allowed mr-opacity-50"
                        : "mr-border-transparent mr-text-white hover:mr-text-green-lighter hover:mr-border-green-lighter mr-cursor-pointer"
                  }`}
                  onClick={() => !tab.disabled && this.setTab(tab.key)}
                  disabled={tab.disabled}
                >
                  <FormattedMessage {...tab.label} />
                </button>
              ))}
              {!disableRapid && (
                <UserEditorSelector
                  {...this.props}
                  pickEditor={this.pickEditor}
                  allowedEditors={this.allowedEditors()}
                />
              )}
            </div>
          ) : null}
          {activeTab === TAB_EDIT ? (
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

registerWidgetType(WithEditor(WithKeyboardShortcuts(TaskMapWidget)), descriptor);
