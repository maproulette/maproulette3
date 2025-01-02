import { Component } from 'react'
import WithProject from '../../components/HOCs/WithProject/WithProject'
import Leaderboard from './Leaderboard'

export class ProjectLeaderboard extends Component {
  render() {
    return (
      <Leaderboard leaderboardOptions={{onlyEnabled: false, filterProjects: true}}
                          projects={[{id: this.props.match.params.projectId}]}
                          displayName={this.props.project?.displayName}
                          suppressCountrySelection={true}
                          {...this.props} />
    );
  }
}

export default WithProject(ProjectLeaderboard)
