import React, { Component } from 'react'
import _get from 'lodash/get'
import WithProject from '../../components/HOCs/WithProject/WithProject'
import Leaderboard from './Leaderboard'

export class ProjectLeaderboard extends Component {
  render() {
    return <Leaderboard leaderboardOptions={{onlyEnabled: false, filterProjects: true}}
                        projects={[{id: this.props.match.params.projectId}]}
                        displayName={_get(this.props.project, 'displayName')}
                        suppressCountrySelection={true}
                        {...this.props} />
  }
}

export default WithProject(ProjectLeaderboard)
