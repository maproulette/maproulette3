import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Switch, Route, withRouter } from 'react-router-dom'
import MediaQuery from 'react-responsive'
import AsManager from '../../interactions/User/AsManager'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithChallenges from '../HOCs/WithChallenges/WithChallenges'
import MobileNotSupported
       from '../MobileNotSupported/MobileNotSupported'
import EditChallenge from './Manage/ManageChallenges/EditChallenge/EditChallenge'
import EditProject from './Manage/EditProject/EditProject'
import EditTask from './Manage/ManageTasks/EditTask/EditTask'
import ReviewTask from './Manage/ReviewTask/ReviewTask'
import ProjectsDashboard from './Manage/ProjectsDashboard/ProjectsDashboard'
import ProjectDashboard from './Manage/ProjectDashboard/ProjectDashboard'
import ChallengeDashboard from './Manage/ChallengeDashboard/ChallengeDashboard'
import MetricsOverview from './MetricsOverview/MetricsOverview'
import SignInButton from '../SignInButton/SignInButton'
import './AdminPane.css'

// Setup child components with needed HOCs.
const MetricsSummary = WithChallenges(MetricsOverview)

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
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0)
    }
  }

  render() {
    // The user needs to be logged in.
    const manager = AsManager(this.props.user)
    if (!manager.isLoggedIn()) {
      return (
        <div className="admin">
          <SignInButton {...this.props} />
        </div>
      )
    }

    return (
      <React.Fragment>
        <MediaQuery query="(max-width: 1023px)">
          <MobileNotSupported forPage />
        </MediaQuery>

        <MediaQuery query="(min-width: 1024px)">
          <div className="admin">
            <div className="admin-pane">
              <Switch>
                <Route exact path='/admin/metrics'
                       render={props => <MetricsSummary allStatuses={true} {...props} />} />
                <Route exact path='/admin/project/:projectId/challenge/:challengeId/task/:taskId/edit'
                       component={EditTask} />
                <Route exact path='/admin/project/:projectId/challenge/:challengeId/task/:taskId/review'
                       component={ReviewTask} />
                <Route exact path='/admin/project/:projectId/challenge/:challengeId'
                       component={ChallengeDashboard} />
                <Route exact path='/admin/project/:projectId/challenges/new'
                       component={EditChallenge} />
                <Route exact path='/admin/project/:projectId/challenge/:challengeId/edit'
                       component={EditChallenge} />
                <Route exact path='/admin/project/:projectId/challenge/:challengeId/clone'
                       component={EditChallenge} />
                <Route exact path='/admin/project/:projectId/edit' component={EditProject} />
                <Route exact path='/admin/projects' component={ProjectsDashboard} />
                <Route exact path='/admin/project/:projectId' component={ProjectDashboard} />
                <Route exact path='/admin/projects/new' component={EditProject} />
                <Route component={ProjectsDashboard} />
              </Switch>
            </div>
          </div>
        </MediaQuery>
      </React.Fragment>
    )
  }
}

AdminPane.propTypes = {
  /** router location */
  location: PropTypes.object.isRequired,
}

export default WithCurrentUser(withRouter(AdminPane))
