import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import WithChallengeMetrics from "../../AdminPane/HOCs/WithChallengeMetrics/WithChallengeMetrics";
import BusySpinner from "../../BusySpinner/BusySpinner";
import ChallengeProgress from "../../ChallengeProgress/ChallengeProgress";
import QuickWidget from "../../QuickWidget/QuickWidget";
import messages from "./Messages";

const descriptor = {
  widgetKey: "CompletionProgressWidget",
  label: messages.label,
  targets: [WidgetDataTarget.challenges, WidgetDataTarget.challenge, WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 5,
  minHeight: 2,
  defaultHeight: 7,
  defaultConfiguration: {
    showByPriority: false,
  },
};

const ChallengeProgressWithMetrics = WithChallengeMetrics(ChallengeProgress, true);

export default class CompletionProgressWidget extends Component {
  setShowByPriority = (showByPriority) => {
    this.props.updateWidgetConfiguration({ showByPriority: !!showByPriority });
  };

  render() {
    const challenge = this.props.task ? this.props.task.parent : this.props.challenge;

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
      content = (
        <ChallengeProgressWithMetrics
          {...this.props}
          className=""
          challenge={challenge}
          showByPriority={this.props.widgetConfiguration.showByPriority}
          setShowByPriority={this.setShowByPriority}
        />
      );
    }

    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        {content}
      </QuickWidget>
    );
  }
}

registerWidgetType(CompletionProgressWidget, descriptor);
