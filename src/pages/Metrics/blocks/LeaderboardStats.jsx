import _map from "lodash/map";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import QuickWidget from "../../../components/QuickWidget/QuickWidget";
import BusySpinner from "../../../components/BusySpinner/BusySpinner";
import messages from "../Messages";

export default class LeaderboardStats extends Component {
  render() {
    // Check if user has opted out of leaderboard
    const userOptedOut =
      this.props.targetUser?.settings?.leaderboardOptOut &&
      this.props.targetUser?.id !== this.props.currentUser?.userId;

    // If user opted out, don't show the leaderboard widget at all
    if (userOptedOut) {
      return null;
    }

    // Show loading spinner only if we're explicitly in a loading state
    if (this.props.loading === true) {
      return (
        <QuickWidget
          {...this.props}
          className="mr-card-widget mr-card-widget--padded mr-mb-4"
          widgetTitle={<FormattedMessage {...messages.leaderboardTitle} />}
          noMain
          permanent
        >
          <div className="mr-flex mr-justify-center mr-py-8">
            <BusySpinner />
          </div>
        </QuickWidget>
      );
    }

    // If leaderboardMetrics is null or undefined, show "no data" state
    if (!this.props.leaderboardMetrics) {
      return (
        <QuickWidget
          {...this.props}
          className="mr-card-widget mr-card-widget--padded mr-mb-4"
          widgetTitle={<FormattedMessage {...messages.leaderboardTitle} />}
          noMain
          permanent
        >
          <div className="mr-text-center mr-py-8 mr-text-grey-light">
            <FormattedMessage {...messages.noChallengesCompleted} />
          </div>
        </QuickWidget>
      );
    }

    // At this point we have leaderboard data, so render it
    const leaderboardMetrics = this.props.leaderboardMetrics;
    const topChallenges = leaderboardMetrics.topChallenges || [];

    return (
      <QuickWidget
        {...this.props}
        className="mr-card-widget mr-card-widget--padded mr-mb-4"
        widgetTitle={<FormattedMessage {...messages.leaderboardTitle} />}
        noMain
        permanent
      >
        <ul className="mr-list-reset mr-mt-3 mr-mb-6">
          <li className="mr-flex mr-items-center">
            <strong className="mr-font-light mr-text-4xl mr-min-w-28 mr-text-yellow">
              {leaderboardMetrics.rank || "N/A"}
            </strong>
            <FormattedMessage {...messages.globalRank} />
          </li>
          <li className="mr-flex mr-items-center">
            <strong className="mr-font-light mr-text-4xl mr-min-w-28 mr-text-yellow">
              {leaderboardMetrics.score || "N/A"}
            </strong>
            <FormattedMessage {...messages.totalPoints} />
          </li>
        </ul>
        <h3 className="mr-text-base mr-pb-3 mr-border-b mr-border-white-10">
          <FormattedMessage {...messages.topChallenges} />
        </h3>
        <ol className="mr-list-reset mr-links-green-lighter">
          {topChallenges.length > 0 ? (
            _map(topChallenges.slice(0, 4), (challenge, index) => {
              return (
                <li key={index} className="mr-mt-3">
                  <a href={"/browse/challenges/" + challenge.id}>{challenge.name}</a>
                </li>
              );
            })
          ) : (
            <li className="mr-mt-3 mr-text-grey-light">
              <FormattedMessage {...messages.noChallengesCompleted} />
            </li>
          )}
        </ol>
      </QuickWidget>
    );
  }
}
