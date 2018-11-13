import React, { Component } from 'react'
import Leaderboard from '../Leaderboard/Leaderboard'
import WithProject from '../HOCs/WithProject/WithProject'
import _get from 'lodash/get'

export class ProjectLeaderboard extends Component {
  render() {
    return <Leaderboard leaderboardOptions={{onlyEnabled: false, filterProjects: true}}
                        projects={[{id: this.props.match.params.projectId}]}
                        displayName={_get(this.props.project, 'displayName')}
                        {...this.props} />
  }
}

export default WithProject(ProjectLeaderboard)
