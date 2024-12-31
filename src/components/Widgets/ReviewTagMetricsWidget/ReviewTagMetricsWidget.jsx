import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import WithReviewTagMetrics from "../../HOCs/WithReviewTagMetrics/WithReviewTagMetrics";
import QuickWidget from "../../QuickWidget/QuickWidget";
import TagMetrics from "../../TagMetrics/TagMetrics";
import messages from "./Messages";

const descriptor = {
  widgetKey: "ReviewTagMetricsWidget",
  label: messages.label,
  targets: [WidgetDataTarget.review],
  minWidth: 2,
  defaultWidth: 4,
  minHeight: 4,
  defaultHeight: 6,
};

export default class ReviewTagMetricsWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
        noMain
      >
        <TagMetrics {...this.props} />
      </QuickWidget>
    );
  }
}

registerWidgetType(WithReviewTagMetrics(ReviewTagMetricsWidget), descriptor);
