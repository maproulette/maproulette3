import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import QuickWidget from "../../QuickWidget/QuickWidget";
import PlaceDescription from "../../TaskPane/PlaceDescription/PlaceDescription";
import TaskLatLon from "../../TaskPane/TaskLatLon/TaskLatLon";
import messages from "./Messages";

const descriptor = {
  widgetKey: "TaskLocationWidget",
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 4,
  minHeight: 4,
  defaultHeight: 4,
};

export default class TaskLocationWidget extends Component {
  toggleReverseLonLat = (reverseLonLat) => {
    this.props.updateUserAppSetting(this.props.user.id, {
      reverseLonLat: !reverseLonLat,
    });
  };

  render() {
    const reverseLonLat =
      this.props.user?.properties?.mr3Frontend?.settings?.reverseLonLat || false;

    return (
      <QuickWidget
        {...this.props}
        className="task-location-widget"
        widgetTitle={<FormattedMessage {...messages.label} />}
        noMain
      >
        <PlaceDescription address={this.props.task.place?.address} className="mr-text-md " />

        <TaskLatLon task={this.props.task} reverse={reverseLonLat} className="mr-text-xs mr-mt-3" />
      </QuickWidget>
    );
  }
}

registerWidgetType(TaskLocationWidget, descriptor);
