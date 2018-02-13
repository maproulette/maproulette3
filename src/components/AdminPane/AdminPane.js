import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import AsManager from '../../services/User/AsManager'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithChallenges from '../HOCs/WithChallenges/WithChallenges'
import Manage from './Manage/Manage'
import EditChallenge from './Manage/ManageChallenges/EditChallenge/EditChallenge'
import EditProject from './Manage/ManageProjects/EditProject/EditProject'
import EditTask from './Manage/ManageTasks/EditTask/EditTask'
import ReviewTask from './Manage/ReviewTask/ReviewTask'
import ChallengeDetails from './Manage/ViewChallenge/ViewChallenge'
import ViewProject from './Manage/ViewProject/ViewProject'
import MetricsOverview from './MetricsOverview/MetricsOverview'
import SignInButton from '../SignInButton/SignInButton'
import messages from './Messages'
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
  render() {
    // The user needs to be logged in.
    const manager = new AsManager(this.props.user)
    if (!manager.isLoggedIn()) {
      return (
        <div className="admin">
          <SignInButton {...this.props}>
            <FormattedMessage {...messages.control} />
          </SignInButton>
        </div>
      )
    }

    return (
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
                   component={ChallengeDetails} />
            <Route exact path='/admin/project/:projectId/challenges/new'
                   component={EditChallenge} />
            <Route exact path='/admin/project/:projectId/challenge/:challengeId/edit'
                   component={EditChallenge} />
            <Route exact path='/admin/project/:projectId/edit' component={EditProject} />
            <Route exact path='/admin/project/:projectId' component={ViewProject} />
            <Route exact path='/admin/projects/new' component={EditProject} />
            <Route exact path='/admin/manage/:projectId' component={Manage} />
            <Route component={Manage} />
          </Switch>
        </div>
      </div>
    )
  }
}

AdminPane.propTypes = {
  /** router location */
  location: PropTypes.object.isRequired,
}

export default WithCurrentUser(AdminPane)
