import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { WidgetDataTarget, registerWidgetType } from "../../../../../services/Widget/Widget";
import BusySpinner from "../../../../BusySpinner/BusySpinner";
import QuickWidget from "../../../../QuickWidget/QuickWidget";
import WithChallengeMetrics from "../../../HOCs/WithChallengeMetrics/WithChallengeMetrics";
import BurndownChart from "../../BurndownChart/BurndownChart";
import messages from "./Messages";
import "./BurndownChartWidget.scss";

const descriptor = {
  widgetKey: "BurndownChartWidget",
  label: messages.label,
  targets: [WidgetDataTarget.challenges, WidgetDataTarget.challenge],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 12,
};

export default class BurndownChartWidget extends Component {
  render() {
    let content = null;
    if (this.props.singleProject) {
      if (!this.props.project) {
        content = <BusySpinner />;
      } else if (this.props.challengeLimitExceeded) {
        content = (
          <div className="mr-text-red">
            Sorry, project statistics are not available for projects with more than{" "}
            {window.env.REACT_APP_PROJECT_CHALLENGE_LIMIT} challenges.
          </div>
        );
      } else if (!this.props.challengeStatsAvailable) {
        content = (
          <button
            type="button"
            className="mr-button"
            onClick={() => this.props.loadChallengeStats(this.props.project)}
          >
            <FormattedMessage {...messages.loadStatsLabel} />
          </button>
        );
      } else if (this.props.loadingChallengeStats) {
        content = <BusySpinner />;
      }
    }

    if (!content) {
      content = <BurndownChart {...this.props} className="mr-h-full" suppressHeading />;
    }

    return (
      <QuickWidget
        {...this.props}
        className="burndown-chart-widget"
        noMain
        widgetTitle={
          this.props.challengeStatsAvailable && !this.props.loadingChallengeStats ? (
            <FormattedMessage
              {...messages.title}
              values={{ taskCount: this.props.tasksAvailable }}
            />
          ) : (
            <FormattedMessage {...messages.label} />
          )
        }
      >
        {content}
      </QuickWidget>
    );
  }
}

registerWidgetType(WithChallengeMetrics(BurndownChartWidget), descriptor);
