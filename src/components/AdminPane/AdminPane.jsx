import PropTypes from "prop-types";
import { Component, Fragment } from "react";
import MediaQuery from "react-responsive";
import { Route, Switch, withRouter } from "react-router-dom";
import AsManager from "../../interactions/User/AsManager";
import SignIn from "../../pages/SignIn/SignIn";
import BusySpinner from "../BusySpinner/BusySpinner";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";
import WithStatus from "../HOCs/WithStatus/WithStatus";
import HeadTitle from "../Head/Head";
import ScreenTooNarrow from "../ScreenTooNarrow/ScreenTooNarrow";
import ChallengeDashboard from "./Manage/ChallengeDashboard/ChallengeDashboard";
import EditProject from "./Manage/EditProject/EditProject";
import EmailRequirementNotice from "./Manage/EmailRequirementNotice/EmailRequirementNotice";
import InspectTask from "./Manage/InspectTask/InspectTask";
import EditChallenge from "./Manage/ManageChallenges/EditChallenge/EditChallenge";
import EditChallenges from "./Manage/ManageChallenges/EditChallenge/EditChallenges";
import EditTask from "./Manage/ManageTasks/EditTask/EditTask";
import ProjectDashboard from "./Manage/ProjectDashboard/ProjectDashboard";
import ProjectsDashboard from "./Manage/ProjectsDashboard/ProjectsDashboard";
import ManageChallengeList from "./Manage/VirtualProjects/ManageChallengeList";
import "./Manage/Widgets/widget_registry.js";
import "./AdminPane.scss";
import TestEnvironmentNotice from "./Manage/TestEnvironmentNotice/TestEnvironmentNotice";

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
      <Fragment>
        <TestEnvironmentNotice />
        <EmailRequirementNotice />
        <div className="admin mr-bg-gradient-r-green-dark-blue mr-text-white">
          <div className="admin-pane">
            <Switch>
              <CustomRoute
                exact
                path="/admin/project/:projectId/challenge/:challengeId"
                component={ChallengeDashboard}
              />
              <CustomRoute
                exact
                path={["/admin/projects/new", "/admin/project/:projectId/edit"]}
                component={EditProject}
              />
              <CustomRoute
                exact
                path={[
                  "/admin/project/:projectId/challenges/new",
                  "/admin/project/:projectId/challenge/:challengeId/edit",
                  "/admin/project/:projectId/challenge/:challengeId/clone",
                ]}
                component={EditChallenge}
              />
              <CustomRoute
                exact
                path="/admin/project/:projectId/challenges/edit"
                component={EditChallenges}
              />
              <CustomRoute
                exact
                path="/admin/project/:projectId/challenge/:challengeId/task/:taskId/edit"
                component={EditTask}
              />
              <CustomRoute
                exact
                path="/admin/project/:projectId/challenge/:challengeId/task/:taskId/inspect"
                component={InspectTask}
              />
              <CustomRoute
                exact
                path="/admin/virtual/project/:projectId/challenges/manage"
                component={ManageChallengeList}
              />
              <CustomRoute exact path="/admin/projects" component={ProjectsDashboard} />
              <CustomRoute exact path="/admin/project/:projectId" component={ProjectDashboard} />
              <CustomRoute component={ProjectsDashboard} />
            </Switch>
          </div>
        </div>
        <MediaQuery query="(max-width: 1023px)">
          <ScreenTooNarrow />
        </MediaQuery>
      </Fragment>
    );
  }
}

AdminPane.propTypes = {
  /** router location */
  location: PropTypes.object.isRequired,
};

export const CustomRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        return (
          <>
            <HeadTitle />
            <Component {...props} />
          </>
        );
      }}
    />
  );
};

export default WithStatus(WithCurrentUser(withRouter(AdminPane)));
