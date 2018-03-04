import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import { withRouter } from 'react-router'
import _isNumber from 'lodash/isNumber'
import AboutPane from './components/AboutPane/AboutPane'
import ChallengePane from './components/ChallengePane/ChallengePane'
import TaskPane from './components/TaskPane/TaskPane'
import AdminPane from './components/AdminPane/AdminPane'
import { GUEST_USER_ID } from './services/User/User'
import WithCurrentUser from './components/HOCs/WithCurrentUser/WithCurrentUser'
import WithCurrentTask from './components/HOCs/WithCurrentTask/WithCurrentTask'
import LoadRandomChallengeTask from './components/LoadRandomChallengeTask/LoadRandomChallengeTask'
import Navbar from './components/Navbar/Navbar'
import UserProfile from './components/UserProfile/UserProfile'
import ErrorModal from './components/ErrorModal/ErrorModal'
import Sprites from './components/Sprites/Sprites'
import './App.css'

// Setup child components with necessary HOCs
const TopNav = withRouter(WithCurrentUser(Navbar))
const CurrentTaskPane = WithCurrentTask(TaskPane)

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
    let firstTimeModal = null
    if (!this.state.firstTimeModalDismissed &&
        (!_isNumber(this.props.initialUserId) ||
         this.props.initialUserId === GUEST_USER_ID)) {
      firstTimeModal = <AboutPane onDismiss={this.dismissModal} {...this.props} />
    }

    return (
      <div className="App">
        <TopNav />

        <Route exact path='/' component={ChallengePane} />
        <Route path='/browse/challenges/:challengeId?' component={ChallengePane} />
        <Route exact path='/challenge/:challengeId/task/:taskId' component={CurrentTaskPane} />
        <Route exact path='/challenge/:challengeId' component={LoadRandomChallengeTask} />
        <Route exact path='/virtual/:virtualChallengeId/task/:taskId' component={CurrentTaskPane} />
        <Route exact path='/task/:taskId' component={CurrentTaskPane} />
        <Route exact path='/about' component={AboutPane} />
        <Route path='/user/profile' component={UserProfile} />
        <Route path='/admin' component={AdminPane} />

        {firstTimeModal}
        <ErrorModal />
        <Sprites />
      </div>
    )
  }
}

export default withRouter(App)
