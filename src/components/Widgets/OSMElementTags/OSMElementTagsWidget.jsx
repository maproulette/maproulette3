import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import OSMElementTags from "../../OSMElementTags/OSMElementTags";
import QuickWidget from "../../QuickWidget/QuickWidget";
import messages from "./Messages";

const descriptor = {
  widgetKey: "OSMElementTagsWidget",
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 3,
  defaultHeight: 6,
};

export default class OSMElementTagsWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <OSMElementTags {...this.props} />
      </QuickWidget>
    );
  }
}

registerWidgetType(OSMElementTagsWidget, descriptor);
