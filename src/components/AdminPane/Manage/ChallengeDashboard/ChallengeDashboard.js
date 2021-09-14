import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormattedMessage, FormattedDate, injectIntl } from "react-intl";
import parse from "date-fns/parse";
import { Link } from "react-router-dom";
import _get from "lodash/get";
import {
  generateWidgetId,
  WidgetDataTarget,
  widgetDescriptor,
} from "../../../../services/Widget/Widget";
import AsBrowsableChallenge from "../../../../interactions/Challenge/AsBrowsableChallenge";
import WithManageableProjects from "../../HOCs/WithManageableProjects/WithManageableProjects";
import WithCurrentProject from "../../HOCs/WithCurrentProject/WithCurrentProject";
import WithCurrentChallenge from "../../HOCs/WithCurrentChallenge/WithCurrentChallenge";
import WithWidgetWorkspaces from "../../../HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces";
import WithSelectedClusteredTasks from "../../../HOCs/WithSelectedClusteredTasks/WithSelectedClusteredTasks";
import WithFilteredClusteredTasks from "../../../HOCs/WithFilteredClusteredTasks/WithFilteredClusteredTasks";
import WithClusteredTasks from "../../../HOCs/WithClusteredTasks/WithClusteredTasks";
import WithChallengeMetrics from "../../HOCs/WithChallengeMetrics/WithChallengeMetrics";
import WithSearch from "../../../HOCs/WithSearch/WithSearch";
import WidgetWorkspace from "../../../WidgetWorkspace/WidgetWorkspace";
import TaskUploadingProgress from "../TaskUploadingProgress/TaskUploadingProgress";
import TaskDeletingProgress from "../TaskDeletingProgress/TaskDeletingProgress";
import ChallengeControls from "../ChallengeCard/ChallengeControls";
import BusySpinner from "../../../BusySpinner/BusySpinner";
import ChallengeNameLink from "../../../ChallengeNameLink/ChallengeNameLink";
import ShareLink from "../../../ShareLink/ShareLink";
import manageMessages from "../Messages";
import "./ChallengeDashboard.scss";

// The name of this dashboard.
const DASHBOARD_NAME = "challenge";

export const defaultDashboardSetup = function () {
  return {
    dataModelVersion: 2,
    name: DASHBOARD_NAME,
    label: "View Challenge",
    widgets: [
      widgetDescriptor("ChallengeOverviewWidget"),
      widgetDescriptor("CompletionProgressWidget"),
      widgetDescriptor("LeaderboardWidget"),
      widgetDescriptor("RecentActivityWidget"),
      widgetDescriptor("CommentsWidget"),
      widgetDescriptor("BurndownChartWidget"),
      widgetDescriptor("StatusRadarWidget"),
      widgetDescriptor("ChallengeTasksWidget"),
    ],
    conditionalWidgets: [
      // conditionally displayed
      "MetaReviewStatusMetricsWidget",
    ],
    layout: [
      { i: generateWidgetId(), x: 0, y: 0, w: 4, h: 7 },
      { i: generateWidgetId(), x: 0, y: 7, w: 4, h: 7 },
      { i: generateWidgetId(), x: 0, y: 14, w: 4, h: 8 },
      { i: generateWidgetId(), x: 0, y: 22, w: 4, h: 14 },
      { i: generateWidgetId(), x: 0, y: 36, w: 4, h: 12 },
      { i: generateWidgetId(), x: 0, y: 48, w: 4, h: 12 },
      { i: generateWidgetId(), x: 0, y: 60, w: 4, h: 12 },
      { i: generateWidgetId(), x: 4, y: 0, w: 8, h: 49 },
    ],
  };
};

/**
 * ChallengeDashboard displays various challenge details and metrics of interest to
 * challenge owners, along with the challenge tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeDashboard extends Component {
  render() {
    // We need to wait for our challenge and for it to be populated
    if (!this.props.challenge || !this.props.challenge.id) {
      return <BusySpinner />;
    }

    const isDeletingTasks = _get(
      this.props,
      "progress.deletingTasks.inProgress",
      false
    );
    if (isDeletingTasks) {
      return <TaskDeletingProgress {...this.props} />;
    }

    const isUploadingTasks = _get(
      this.props,
      "progress.creatingTasks.inProgress",
      false
    );
    if (isUploadingTasks) {
      return <TaskUploadingProgress {...this.props} />;
    }

    console.log("asdkfjasdf", this.props.challenge.systemArchivedAt);

    const projectId = _get(this.props, "challenge.parent.id");

    const pageHeader = (
      <div className="admin__manage__header admin__manage__header--flush">
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li className="nav-title">
              <Link to="/admin/projects">
                <FormattedMessage {...manageMessages.manageHeader} />
              </Link>
            </li>
            <li>
              <Link to={`/admin/project/${projectId}`}>
                {_get(this.props, "challenge.parent.displayName") ||
                  _get(this.props, "challenge.parent.name")}
              </Link>
            </li>
            <li className="is-active">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <ChallengeNameLink {...this.props} suppressShareLink />
              <ShareLink
                {...this.props}
                link={AsBrowsableChallenge(this.props.challenge).browseURL()}
                showLeft
              />
              {this.props.loadingChallenge && <BusySpinner inline />}
            </li>
          </ul>
        </nav>

        <ChallengeControls
          {...this.props}
          className="admin__manage__controls mr-flex"
          controlClassName="mr-button mr-button--dark mr-button--small mr-mr-4"
          onChallengeDashboard
        />

        {this.props.challenge.isArchived &&
          this.props.challenge.systemArchivedAt && (
            <div className="mr-mt-6 mr-text-red-light">
              <FormattedMessage {...manageMessages.staleChallengeMessage1} />{" "}
              <FormattedDate
                value={parse(this.props.challenge.systemArchivedAt)}
                year="numeric"
                month="long"
                day="2-digit"
              />{" "}
              <FormattedMessage {...manageMessages.staleChallengeMessage2} />
            </div>
          )}
      </div>
    );

    return (
      <div className="admin__manage challenge-dashboard">
        <WidgetWorkspace
          {...this.props}
          lightMode={false}
          darkMode
          className="mr-cards-inverse"
          workspaceEyebrow={pageHeader}
          challenges={[this.props.challenge]}
          pageId="ChallengeDashboard"
          metaReviewEnabled={
            process.env.REACT_APP_FEATURE_META_QC === "enabled"
          }
        />
      </div>
    );
  }
}

ChallengeDashboard.propTypes = {
  /** The parent project of the challenge */
  project: PropTypes.object,
  /** The current challenge to view */
  challenge: PropTypes.object,
  /** Set to true if challenge data is still loading */
  loadingChallenge: PropTypes.bool.isRequired,
  /** Invoked when the user wishes to delete the challenge */
  deleteChallenge: PropTypes.func.isRequired,
  /** Invoked when the user wishes to move the challenge */
  moveChallenge: PropTypes.func.isRequired,
};

export default WithManageableProjects(
  WithCurrentProject(
    WithSearch(
      WithCurrentChallenge(
        WithWidgetWorkspaces(
          WithSelectedClusteredTasks(
            WithClusteredTasks(
              WithFilteredClusteredTasks(
                WithChallengeMetrics(injectIntl(ChallengeDashboard)),
                "clusteredTasks",
                "filteredClusteredTasks"
              )
            )
          ),
          WidgetDataTarget.challenge,
          DASHBOARD_NAME,
          defaultDashboardSetup
        )
      ),
      "challengeOwner"
    )
  )
);
