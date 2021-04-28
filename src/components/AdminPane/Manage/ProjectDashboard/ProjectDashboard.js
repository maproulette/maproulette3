import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormattedMessage, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import AsManager from "../../../../interactions/User/AsManager";
import {
  generateWidgetId,
  WidgetDataTarget,
  widgetDescriptor,
} from "../../../../services/Widget/Widget";
import {
  challengePassesFilters,
  defaultChallengeFilters,
} from "../../../../services/Widget/ChallengeFilter/ChallengeFilter";
import WithManageableProjects from "../../HOCs/WithManageableProjects/WithManageableProjects";
import WithCurrentProject from "../../HOCs/WithCurrentProject/WithCurrentProject";
import WithWidgetWorkspaces from "../../../HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces";
import WithDashboardEntityFilter from "../../HOCs/WithDashboardEntityFilter/WithDashboardEntityFilter";
import WidgetWorkspace from "../../../WidgetWorkspace/WidgetWorkspace";
import ChallengeFilterGroup from "../ChallengeFilterGroup/ChallengeFilterGroup";
import ConfirmAction from "../../../ConfirmAction/ConfirmAction";
import BusySpinner from "../../../BusySpinner/BusySpinner";
import manageMessages from "../Messages";
import messages from "./Messages";
import "./ProjectDashboard.scss";
import WithProjectManagement from "../../HOCs/WithProjectManagement/WithProjectManagement";

// The name of this dashboard.
const DASHBOARD_NAME = "project";

export const defaultDashboardSetup = function () {
  return {
    dataModelVersion: 2,
    name: DASHBOARD_NAME,
    label: "View Project",
    filters: defaultChallengeFilters(),
    widgets: [
      widgetDescriptor("ProjectOverviewWidget"),
      widgetDescriptor("CompletionProgressWidget"),
      widgetDescriptor("BurndownChartWidget"),
      widgetDescriptor("CommentsWidget"),
      widgetDescriptor("ProjectManagersWidget"),
      widgetDescriptor("ChallengeListWidget"),
    ],
    permanentWidgets: [
      // Cannot be removed from workspace
      "ChallengeListWidget",
    ],
    conditionalWidgets: [
      // conditionally displayed
      "MetaReviewStatusMetricsWidget",
    ],
    layout: [
      { i: generateWidgetId(), x: 0, y: 0, w: 4, h: 7 },
      { i: generateWidgetId(), x: 0, y: 7, w: 4, h: 7 },
      { i: generateWidgetId(), x: 0, y: 14, w: 4, h: 12 },
      { i: generateWidgetId(), x: 0, y: 26, w: 4, h: 10 },
      { i: generateWidgetId(), x: 0, y: 36, w: 4, h: 8 },
      { i: generateWidgetId(), x: 8, y: 0, w: 8, h: 34 },
    ],
  };
};

export class ProjectDashboardInternal extends Component {
  deleteProject = () => {
    this.props.deleteProject(this.props.project.id).then(() => {
      this.props.history.replace("/admin/projects");
    });
  };

  archiveProject = () => {
    this.props.archiveProject(this.props.project.id);
  };

  unarchiveProject = () => {
    this.props.unarchiveProject(this.props.project.id);
  };

  render() {
    if (this.props.loadingProject) {
      return (
        <div data-testid="loading-indicator">
          <BusySpinner />
        </div>
      );
    }

    if (!this.props.project) {
      return (
        <div className="nav-title">
          <FormattedMessage {...messages.projectNotFound} />
        </div>
      );
    }

    const manager = AsManager(this.props.user);
    const isVirtual = this.props.project.isVirtual;
    const isArchived = this.props.project.isArchived;

    const pageHeader = (
      <div className="admin__manage__header admin__manage__header--flush">
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li className="nav-title">
              <Link to="/admin/projects">
                <FormattedMessage {...manageMessages.manageHeader} />
              </Link>
            </li>
            <li className="is-active">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a aria-current="page">
                {this.props.project.displayName || this.props.project.name}
                {isVirtual ? (
                  <span className="mr-mx-4 mr-text-pink mr-text-sm">
                    <FormattedMessage {...manageMessages.virtualHeader} />
                  </span>
                ) : null}
              </a>
            </li>
          </ul>
        </nav>

        <div className="admin__manage__controls mr-flex">
          {manager.canWriteProject(this.props.project) && !isVirtual && (
            <Link
              to={`/admin/project/${this.props.project.id}/challenges/new`}
              className="mr-button mr-button--dark mr-button--small mr-mr-4"
            >
              <FormattedMessage {...messages.addChallengeLabel} />
            </Link>
          )}

          {manager.canWriteProject(this.props.project) && isVirtual && (
            <Link
              to={`/admin/virtual/project/${this.props.project.id}/challenges/manage`}
              className="mr-button mr-button--dark mr-button--small mr-mr-4"
            >
              <FormattedMessage {...messages.manageChallengesLabel} />
            </Link>
          )}

          {manager.canWriteProject(this.props.project) && (
            <Link
              to={`/admin/project/${this.props.project.id}/edit`}
              className="mr-button mr-button--dark mr-button--small mr-mr-4"
            >
              <FormattedMessage {...messages.editProjectLabel} />
            </Link>
          )}

          {manager.canAdministrateProject(this.props.project) && (
            <ConfirmAction>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                onClick={this.deleteProject}
                className="mr-button mr-button--dark mr-button--small mr-mr-4"
              >
                <FormattedMessage {...messages.deleteProjectLabel} />
              </a>
            </ConfirmAction>
          )}

          {manager.canAdministrateProject(this.props.project) &&
          !isArchived &&
          !isVirtual ? (
            <>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                onClick={this.archiveProject}
                className="mr-button mr-button--dark mr-button--small mr-mr-4"
              >
                <FormattedMessage {...messages.archiveProjectLabel} />
              </a>
            </>
          ) : null}

          {manager.canAdministrateProject(this.props.project) &&
          isArchived &&
          !isVirtual ? (
            <>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                onClick={this.unarchiveProject}
                className="mr-button mr-button--dark mr-button--small mr-mr-4"
              >
                <FormattedMessage {...messages.unarchiveProjectLabel} />
              </a>
            </>
          ) : null}
        </div>
      </div>
    );

    return (
      <div
        data-testid="project-dashboard"
        className="admin__manage project-dashboard"
      >
        <WidgetWorkspace
          {...this.props}
          lightMode={false}
          darkMode
          className="mr-mt-4 mr-cards-inverse"
          workspaceEyebrow={pageHeader}
          filterComponent={ChallengeFilterGroup}
          activity={this.props.project.activity}
          singleProject
        />
      </div>
    );
  }
}

ProjectDashboardInternal.propTypes = {
  /** The parent project of the challenge */
  project: PropTypes.object,
  /** Set to true if the project data is still being retrieved */
  loadingProject: PropTypes.bool,
  /** Set to true if the challenges data are still being retrieved */
  loadingChallenges: PropTypes.bool,

  /** These props are required by WidgetWorkspace and directly passed to it, thereby they are required here */
  name: PropTypes.string.isRequired,
  targets: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  defaultConfiguration: PropTypes.func.isRequired,
};

const ProjectDashboard = WithProjectManagement(
  WithManageableProjects(
    WithCurrentProject(
      WithWidgetWorkspaces(
        WithDashboardEntityFilter(
          injectIntl(ProjectDashboardInternal),
          "challenge",
          "challenges",
          "pinnedChallenges",
          "challenges",
          challengePassesFilters
        ),
        [WidgetDataTarget.project, WidgetDataTarget.challenges],
        DASHBOARD_NAME,
        defaultDashboardSetup
      ),
      {
        restrictToGivenProjects: true,
        includeChallenges: true,
        includeComments: true,
      }
    )
  )
);

export default ProjectDashboard;
