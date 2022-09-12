import React, { Component } from "react";
import PropTypes from "prop-types";
import { Switch, Route, withRouter } from "react-router-dom";
import MediaQuery from "react-responsive";
import AsManager from "../../interactions/User/AsManager";
import SignIn from "../../pages/SignIn/SignIn";
import WithStatus from "../HOCs/WithStatus/WithStatus";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";
import ScreenTooNarrow from "../ScreenTooNarrow/ScreenTooNarrow";
import EditChallenge from "./Manage/ManageChallenges/EditChallenge/EditChallenge";
import EditChallenges from "./Manage/ManageChallenges/EditChallenge/EditChallenges";
import EditProject from "./Manage/EditProject/EditProject";
import ManageChallengeList from "./Manage/VirtualProjects/ManageChallengeList";
import EditTask from "./Manage/ManageTasks/EditTask/EditTask";
import InspectTask from "./Manage/InspectTask/InspectTask";
import ProjectsDashboard from "./Manage/ProjectsDashboard/ProjectsDashboard";
import ProjectDashboard from "./Manage/ProjectDashboard/ProjectDashboard";
import ChallengeDashboard from "./Manage/ChallengeDashboard/ChallengeDashboard";
import BusySpinner from "../BusySpinner/BusySpinner";
import EmailRequirementNotice from "./Manage/EmailRequirementNotice/EmailRequirementNotice";
import "./Manage/Widgets/widget_registry.js";
import "./AdminPane.scss";

/**
 * AdminPane is the top-level component for administration functions. It has a
 * Projects tab for management of projects, challenges, and tasks, and a
 * Metrics tab for display of various summary metrics. It's worth noting that
 * all logged-in users have access to the AdminPane.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class AdminPane extends Component {
  componentDidUpdate(prevProps) {
    if (
      this.props.location.pathname !== prevProps.location.pathname &&
      this.props.location.search !== prevProps.location.search
    ) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    // The user needs to be logged in.
    const manager = AsManager(this.props.user);
    if (!manager.isLoggedIn()) {
      return this.props.checkingLoginStatus ? (
        <div className="admin mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
          <BusySpinner />
        </div>
      ) : (
        <SignIn {...this.props} />
      );
    }

    return (
      <React.Fragment>
        <EmailRequirementNotice />
        <div className="admin mr-bg-gradient-r-green-dark-blue mr-text-white">
          <div className="admin-pane">
            <Switch>
              <Route
                exact
                path="/admin/project/:projectId/challenge/:challengeId"
                component={ChallengeDashboard}
              />
              <Route
                exact
                path={["/admin/projects/new", "/admin/project/:projectId/edit"]}
                component={EditProject}
              />
              <Route
                exact
                path={[
                  "/admin/project/:projectId/challenges/new",
                  "/admin/project/:projectId/challenge/:challengeId/edit",
                  "/admin/project/:projectId/challenge/:challengeId/clone",
                ]}
                component={EditChallenge}
              />
              <Route
                exact
                path="/admin/project/:projectId/challenges/edit"
                component={EditChallenges}
              />
              <Route
                exact
                path="/admin/project/:projectId/challenge/:challengeId/task/:taskId/edit"
                component={EditTask}
              />
              <Route
                exact
                path="/admin/project/:projectId/challenge/:challengeId/task/:taskId/inspect"
                component={InspectTask}
              />
              <Route
                exact
                path="/admin/virtual/project/:projectId/challenges/manage"
                component={ManageChallengeList}
              />
              <Route
                exact
                path="/admin/projects"
                component={ProjectsDashboard}
              />
              <Route
                exact
                path="/admin/project/:projectId"
                component={ProjectDashboard}
              />
              <Route component={ProjectsDashboard} />
            </Switch>
          </div>
        </div>
        <MediaQuery query="(max-width: 1023px)">
          <ScreenTooNarrow />
        </MediaQuery>
      </React.Fragment>
    );
  }
}

AdminPane.propTypes = {
  /** router location */
  location: PropTypes.object.isRequired,
};

export default WithStatus(WithCurrentUser(withRouter(AdminPane)));
