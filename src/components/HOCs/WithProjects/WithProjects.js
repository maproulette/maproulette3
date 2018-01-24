import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import { compact as _compact,
         map as _map,
         get as _get } from 'lodash'
import { projectSchema } from '../../../services/Project/Project'
import { fetchProjectChallenges } from '../../../services/Challenge/Challenge'

const mapStateToProps = (state, ownProps) => ({
  projects: _compact(_map(_get(state, 'entities.projects', {}),
    project => project.id ?
              denormalize(project, projectSchema(), state.entities) :
              null))
})

const mapDispatchToProps = dispatch => ({
  fetchProjectChallenges: (projectId) => dispatch(fetchProjectChallenges(projectId)),
})

const WithProjects =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export default WithProjects
