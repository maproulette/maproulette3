import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import _compact from 'lodash/compact'
import _map from 'lodash/map'
import _get from 'lodash/get'
import { projectSchema } from '../../../services/Project/Project'
import { fetchProjectChallenges } from '../../../services/Challenge/Challenge'

export const mapStateToProps = (state, ownProps) => ({
  projects: _compact(_map(_get(state, 'entities.projects', {}),
    project => project.id ?
              denormalize(project, projectSchema(), state.entities) :
              null))
})

export const mapDispatchToProps = dispatch => ({
  fetchProjectChallenges: (projectId) => dispatch(fetchProjectChallenges(projectId)),
})

const WithProjects =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export default WithProjects
