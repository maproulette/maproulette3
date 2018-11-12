import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { withRouter } from 'react-router'
import _isNumber from 'lodash/isNumber'
import AboutPane from './components/AboutPane/AboutPane'
import ChallengePane from './components/ChallengePane/ChallengePane'
import TaskPane from './components/TaskPane/TaskPane'
import AdminPane from './components/AdminPane/AdminPane'
import PageNotFound from './components/PageNotFound/PageNotFound'
import { GUEST_USER_ID } from './services/User/User'
import { resetCache } from './services/Server/RequestCache'
import WithCurrentUser from './components/HOCs/WithCurrentUser/WithCurrentUser'
import WithCurrentTask from './components/HOCs/WithCurrentTask/WithCurrentTask'
import WithExternalError
       from './components/HOCs/WithExternalError/WithExternalError'
import WithVirtualChallenge
       from './components/HOCs/WithVirtualChallenge/WithVirtualChallenge'
import LoadRandomChallengeTask
       from './components/LoadRandomChallengeTask/LoadRandomChallengeTask'
import LoadRandomVirtualChallengeTask
       from './components/LoadRandomVirtualChallengeTask/LoadRandomVirtualChallengeTask'
import Navbar from './components/Navbar/Navbar'
import UserProfile from './components/UserProfile/UserProfile'
import Leaderboard from './components/Leaderboard/Leaderboard'
import ChallengeLeaderboard from './components/ChallengeLeaderboard/ChallengeLeaderboard'
import ErrorModal from './components/ErrorModal/ErrorModal'
import Sprites from './components/Sprites/Sprites'
import MobileNotSupported
       from './components/MobileNotSupported/MobileNotSupported'
import './App.css'

// Setup child components with necessary HOCs
const TopNav = withRouter(WithCurrentUser(Navbar))
const CurrentTaskPane = WithCurrentTask(TaskPane)
const CurrentVirtualChallengeTaskPane =
  WithVirtualChallenge(WithCurrentTask(TaskPane))
const VirtualChallengePane = WithVirtualChallenge(ChallengePane)
const ErrorPane = WithExternalError(ChallengePane)

/**
 * App represents the top level component of the application.  It renders a
 * TopNav, the appropriate component pane based on the current route, and some
 * utility components like the Sprites and ErrorModal.
 *
 * @see See TopNav
 * @see See ChallengePane
 * @see See TaskPane
 * @see See AdminPane
 * @see See AboutPane
 * @see See ErrorModal
 * @see See Sprites
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class App extends Component {
  state = {
    firstTimeModalDismissed: false,
  }

  dismissModal = () => {
    this.setState({firstTimeModalDismissed: true})
  }

  render() {
    // We don't currently support mobile devices. Unless the mobile feature
    // is explicitly enabled, inform user that mobile is not supported.
    if (process.env.REACT_APP_FEATURE_MOBILE_DEVICES !== 'enabled') {
      // This is a pretty simplistic check, but it should catch most cases.
      if (/iPhone|iPad|iPod|BlackBerry|IEMobile|Fennec|Android|Mobile|Tablet/i.test(navigator.userAgent)) {
        return <MobileNotSupported />
      }
    }

    let firstTimeModal = null
    if (!this.state.firstTimeModalDismissed &&
        (!_isNumber(this.props.initialUserId) ||
         this.props.initialUserId === GUEST_USER_ID)) {
      firstTimeModal = <AboutPane onDismiss={this.dismissModal} {...this.props} />
    }

    return (
      <div className="App">
        <TopNav />

        <Switch>
          <CachedRoute exact path='/' component={ChallengePane} />
          <CachedRoute path='/browse/challenges/:challengeId?' component={ChallengePane} />
          <CachedRoute path='/browse/virtual/:virtualChallengeId' component={VirtualChallengePane} />
          <CachedRoute exact path='/challenge/:challengeId/task/:taskId' component={CurrentTaskPane} />
          <CachedRoute exact path='/challenge/:challengeId' component={LoadRandomChallengeTask} />
          <CachedRoute exact path='/virtual/:virtualChallengeId/task/:taskId'
                 component={CurrentVirtualChallengeTaskPane} />
          <CachedRoute exact path='/virtual/:virtualChallengeId'
                 component={LoadRandomVirtualChallengeTask} />
          <CachedRoute exact path='/task/:taskId' component={CurrentTaskPane} />
          <CachedRoute exact path='/about' component={AboutPane} />
          <CachedRoute path='/user/profile' component={UserProfile} />
          <CachedRoute path='/leaderboard' component={Leaderboard} />
          <CachedRoute path='/challenge/:challengeId/leaderboard' component={ChallengeLeaderboard} />
          <CachedRoute path='/admin' component={AdminPane} />
          <CachedRoute path='/error' component={ErrorPane} />
          <Route component={PageNotFound} />
        </Switch>

        {firstTimeModal}
        <ErrorModal />
        <Sprites />
      </div>
    )
  }
}

/**
 * Simple wrapper for Route that clears the request cache prior to rendering.
 */
export const CachedRoute=({component: Component, ...rest}) => (
  <Route {...rest}
         render={props => {
           resetCache()
           return <Component {...props} />
         }} />
)

export default withRouter(App)
