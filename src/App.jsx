import { Component, Fragment } from "react";
import { withRouter } from "react-router";
import { Redirect, Route, Switch } from "react-router-dom";
import AdminPane from "./components/AdminPane/AdminPane";
import InspectTask from "./components/AdminPane/Manage/InspectTask/InspectTask";
import ChallengeDetail from "./components/ChallengeDetail/ChallengeDetail";
// import CountryLeaderboard from './pages/Leaderboard/CountryLeaderboard'
import ChallengePane from "./components/ChallengePane/ChallengePane";
import CheckForToken from "./components/CheckForToken/CheckForToken";
import ErrorModal from "./components/ErrorModal/ErrorModal";
import Footer from "./components/Footer/Footer";
import FundraisingNotices from "./components/FundraisingNotices/FundraisingNotices";
import WithCurrentTask from "./components/HOCs/WithCurrentTask/WithCurrentTask";
import WithCurrentUser from "./components/HOCs/WithCurrentUser/WithCurrentUser";
import WithExternalError from "./components/HOCs/WithExternalError/WithExternalError";
import WithVirtualChallenge from "./components/HOCs/WithVirtualChallenge/WithVirtualChallenge";
import HeadTitle from "./components/Head/Head";
import LoadRandomChallengeTask from "./components/LoadRandomChallengeTask/LoadRandomChallengeTask";
import LoadRandomVirtualChallengeTask from "./components/LoadRandomVirtualChallengeTask/LoadRandomVirtualChallengeTask";
import MobileNotSupported from "./components/MobileNotSupported/MobileNotSupported";
import Navbar from "./components/Navbar/Navbar";
import PageNotFound from "./components/PageNotFound/PageNotFound";
import ProjectDetail from "./components/ProjectDetail/ProjectDetail";
import ReviewTaskPane from "./components/ReviewTaskPane/ReviewTaskPane";
import Sprites from "./components/Sprites/Sprites";
import SuperAdminContainer from "./components/SuperAdmin/SuperAdminContainer";
import SystemNotices from "./components/SystemNotices/SystemNotices";
import PublicTaskPane from "./components/TaskPane/PublicTaskPane";
import TaskPane from "./components/TaskPane/TaskPane";
import Achievements from "./pages/Achievements/Achievements";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import GlobalActivity from "./pages/GlobalActivity/GlobalActivity";
import Home from "./pages/Home/Home";
import Inbox from "./pages/Inbox/Inbox";
import ChallengeLeaderboard from "./pages/Leaderboard/ChallengeLeaderboard";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import ProjectLeaderboard from "./pages/Leaderboard/ProjectLeaderboard";
import Metrics from "./pages/Metrics/Metrics";
import Profile from "./pages/Profile/Profile";
import Review from "./pages/Review/Review";
import Sent from "./pages/Sent/Sent";
import Social from "./pages/Social/Social";
import Teams from "./pages/Teams/Teams";
import { resetCache } from "./services/Server/RequestCache";
import "./components/Widgets/widget_registry";
import "./App.scss";
import TestEnvironmentBanner from "./components/TestEnvironmentBanner/TestEnvironmentBanner.jsx";

// Setup child components with necessary HOCs
const TopNav = withRouter(WithCurrentUser(Navbar));

const CurrentTaskPaneInternal = (props) => {
  const loggedIn = localStorage.getItem("isLoggedIn");
  return loggedIn ? <TaskPane {...props} /> : <PublicTaskPane {...props} />;
};
const CurrentTaskPane = WithCurrentTask(CurrentTaskPaneInternal);

const CurrentReviewTaskPane = WithCurrentTask(ReviewTaskPane, true);
const CurrentMetaReviewTaskPane = WithCurrentTask(ReviewTaskPane, true);
const CurrentVirtualChallengeTaskPane = WithVirtualChallenge(WithCurrentTask(TaskPane));
const VirtualChallengePane = WithVirtualChallenge(ChallengeDetail);
const ErrorPane = WithExternalError(ChallengePane);
const HomeOrDashboard = () => {
  const goHome = sessionStorage.getItem("goHome");
  const loggedIn = localStorage.getItem("isLoggedIn");
  sessionStorage.removeItem("goHome");
  return loggedIn && !goHome ? <Redirect to="/dashboard" /> : <Home />;
};

/**
 * App represents the top level component of the application.  It renders a
 * Navbar, the appropriate page based on the current route, and some utility
 * components like the Sprites and ErrorModal
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class App extends Component {
  state = {
    firstTimeModalDismissed: false,
    shouldDisplayError: true,
  };

  dismissModal = () => {
    this.setState({ firstTimeModalDismissed: true });
  };

  render() {
    // We don't currently support mobile devices. Unless the mobile feature
    // is explicitly enabled, inform user that mobile is not supported.
    if (window.env.REACT_APP_FEATURE_MOBILE_DEVICES !== "enabled") {
      // This is a pretty simplistic check, but it should catch most cases.
      if (
        /iPhone|iPad|iPod|BlackBerry|IEMobile|Fennec|Android|Mobile|Tablet/i.test(
          navigator.userAgent,
        )
      ) {
        return <MobileNotSupported />;
      }
    }

    return (
      <Fragment>
        <TopNav />
        <TestEnvironmentBanner />
        <SystemNotices />
        <FundraisingNotices />
        <CheckForToken>
          <main role="main" className="mr-bg-white mr-text-grey">
            <Switch>
              <CachedRoute exact path="/" component={HomeOrDashboard} />
              <CachedRoute exact path="/browse/challenges" component={ChallengePane} />
              <CachedRoute path="/browse/challenges/:challengeId" component={ChallengeDetail} />
              <CachedRoute path="/browse/projects/:projectId" component={ProjectDetail} />
              <CachedRoute
                path="/browse/virtual/:virtualChallengeId"
                component={VirtualChallengePane}
              />
              <CachedRoute
                exact
                path="/challenge/:challengeId/task/:taskId"
                component={CurrentTaskPane}
              />
              <CachedRoute
                exact
                path="/challenge/:challengeId"
                component={LoadRandomChallengeTask}
              />
              <CachedRoute
                exact
                path="/virtual/:virtualChallengeId/task/:taskId"
                component={CurrentVirtualChallengeTaskPane}
              />
              <CachedRoute
                exact
                path="/virtual/:virtualChallengeId"
                component={LoadRandomVirtualChallengeTask}
              />
              <CachedRoute exact path="/task/:taskId" component={CurrentTaskPane} />
              <CachedRoute exact path="/task/:taskId/review" component={CurrentReviewTaskPane} />
              <CachedRoute path="/user/profile/:userId" component={Profile} />
              <CachedRoute path="/user/profile" component={Profile} />
              <CachedRoute path="/user/metrics/:userId" component={Metrics} />
              <CachedRoute path="/user/metrics" component={Metrics} />
              <CachedRoute exact path="/superadmin" component={SuperAdminContainer} />
              <CachedRoute path="/user/achievements/:userId" component={Achievements} />
              <CachedRoute path="/user/achievements" component={Achievements} />
              <CachedRoute path="/dashboard" component={Dashboard} />
              <CachedRoute path="/leaderboard" component={Leaderboard} />
              <CachedRoute exact path="/review/:showType" component={Review} />
              <CachedRoute path="/review" component={Review} />
              <CachedRoute path="/inbox" component={Inbox} />
              <CachedRoute path="/sent" component={Sent} />
              <CachedRoute path="/teams" component={Teams} />
              <CachedRoute path="/social" component={Social} />
              <CachedRoute path="/activity" component={GlobalActivity} />
              <CachedRoute
                path="/challenge/:challengeId/leaderboard"
                component={ChallengeLeaderboard}
              />
              <CachedRoute path="/project/:projectId/leaderboard" component={ProjectLeaderboard} />
              {/* <CachedRoute path='/country/:countryCode/leaderboard' component={CountryLeaderboard} /> */}
              <CachedRoute
                path="/challenge/:challengeId/task/:taskId/inspect"
                component={InspectTask}
              />
              <CachedRoute
                path="/challenge/:challengeId/task/:taskId/review"
                component={CurrentReviewTaskPane}
              />
              <CachedRoute
                path="/challenge/:challengeId/task/:taskId/meta-review"
                component={CurrentMetaReviewTaskPane}
              />
              <CachedRoute path="/admin" component={AdminPane} />
              <CachedRoute path="/error" component={ErrorPane} />
              <Route component={PageNotFound} />
            </Switch>
          </main>
        </CheckForToken>
        <Footer />
        <ErrorModal />
        <Sprites />
      </Fragment>
    );
  }
}

/**
 * Simple wrapper for Route that clears the request cache prior to rendering.
 */
export const CachedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        resetCache();
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

export default withRouter(App);
