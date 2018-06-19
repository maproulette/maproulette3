import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _values from 'lodash/values'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _omit from 'lodash/omit'
import { fetchProject,
         fetchProjectActivity,
         fetchProjectManagers,
         addProjectManager,
         setProjectManagerPermissions,
         removeProjectManager,
         saveProject,
         deleteProject} from '../../../../services/Project/Project'
import { fetchProjectChallenges,
         fetchProjectChallengeActions,
         fetchLatestProjectChallengeActivity }
       from '../../../../services/Challenge/Challenge'
import AppErrors from '../../../../services/Error/AppErrors'
import { addError } from '../../../../services/Error/Error'
import WithCurrentUser from '../../../HOCs/WithCurrentUser/WithCurrentUser'
import AsManager from '../../../../interactions/User/AsManager'

/**
 * WithCurrentProject makes available to the WrappedComponent the current
 * project from the route as well as relevant edit functions. Child
 * challenges can optionally be requested, which will be presented as
 * a challenges prop (not embedded within the project object).
 *
 * Supported options:
 * - includeChallenges
 * - includeActivity
 * - historicalMonths
 * - defaultToOnlyProject
 * - restrictToGivenProjects
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithCurrentProject = function(WrappedComponent, options={}) {
  return class extends Component {
    state = {
      loadingProject: true,
      loadingChallenges: options.includeChallenges,
    }

    routedProjectId = props =>
      parseInt(_get(props, 'match.params.projectId'), 10)

    routedChallengeId = props =>
      parseInt(_get(props, 'match.params.challengeId'), 10)

    currentProjectId = props => {
      let projectId = this.routedProjectId(props)

      // If there is no routed project, but we've been given only a single
      // project and the defaultToOnlyProject option is true, then go ahead and
      // use that project.
      if (!_isFinite(projectId) &&
          options.defaultToOnlyProject &&
          _get(props, 'projects.length', 0) === 1) {
        projectId = props.projects[0].id
      }
      else if (_isFinite(projectId) && options.restrictToGivenProjects) {
        if (!_find(props.projects, {id: projectId})) {
          projectId = null
        }
      }

      return projectId
    }

    loadProject = props => {
      const projectId = this.currentProjectId(props)

      if (_isFinite(this.routedProjectId(props)) && projectId === null) {
        this.props.notManagerError()
        props.history.push('/admin/projects')
        return
      }

      if (_isFinite(projectId)) {
        this.setState({
          loadingProject: true,
          loadingChallenges: options.includeChallenges,
        })

        props.fetchProject(projectId).then(normalizedProject => {
          const project = normalizedProject.entities.projects[normalizedProject.result]

          const manager = AsManager(this.props.user)
          if (!manager.canManage(project)) {
            // If we have a challenge id too, route to the browse url for the challenge
            const challengeId = this.routedChallengeId(this.props)
            if (_isFinite(challengeId)) {
              props.history.replace(`/browse/challenges/${challengeId}`)
            }
            else {
              this.props.notManagerError()
              props.history.push('/admin/projects')
            }
            return
          }

          if (options.includeActivity) {
            // Used for daily heatmap
            props.fetchProjectActivity(projectId, new Date(project.created)).then(() =>
              this.setState({loadingProject: false})
            )
          }
          else {
            this.setState({loadingProject: false})
          }
        })

        if (options.includeChallenges) {
          const retrievals = []
          retrievals.push(props.fetchProjectChallenges(projectId))

          if (options.includeActivity) {
            // Used to display completion progress for each challenge
            retrievals.push(props.fetchProjectChallengeActions(projectId))

            // Used to display latest activity for each challenge
            retrievals.push(props.fetchLatestProjectChallengeActivity(projectId))
          }

          Promise.all(retrievals).then(() =>
            this.setState({loadingChallenges: false})
          )
        }
      }
      else {
        this.setState({loadingProject: false, loadingChallenges: false})
      }
    }

    componentWillMount() {
      this.loadProject(this.props)
    }

    componentWillReceiveProps(nextProps) {
      const nextProjectId = this.currentProjectId(nextProps)

      if ( _isFinite(nextProjectId) &&
           nextProjectId !== this.currentProjectId(this.props)) {
        this.loadProject(nextProps)
      }
    }

    render() {
      const projectId = this.currentProjectId(this.props)
      const project = !_isFinite(projectId) ? null :
                      _get(this.props, `entities.projects.${projectId}`)
      let challenges = this.props.challenges // pass through challenges by default

      if (options.includeChallenges && _isFinite(projectId)) {
        const allChallenges = _values(_get(this.props, 'entities.challenges', {}))
        challenges = _filter(allChallenges, {parent: projectId})
      }

      return <WrappedComponent {..._omit(this.props, ['entities',
                                                      'notManagerError',
                                                      'fetchProject',
                                                      'fetchProjectChallenges'])}
                               project={project}
                               challenges={challenges}
                               routedProjectId={this.routedProjectId(this.props)}
                               loadingProject={this.state.loadingProject}
                               loadingChallenges={this.state.loadingChallenges} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities,
})

const mapDispatchToProps = dispatch => ({
  fetchProject: projectId => dispatch(fetchProject(projectId)),
  fetchProjectActivity: (projectId, startDate) =>
    dispatch(fetchProjectActivity(projectId, startDate)),
  saveProject: projectData => dispatch(saveProject(projectData)),
  fetchProjectChallenges: projectId =>
    dispatch(fetchProjectChallenges(projectId, -1)),
  fetchLatestProjectChallengeActivity: projectId =>
    dispatch(fetchLatestProjectChallengeActivity(projectId)),
  fetchProjectChallengeActions: projectId =>
    dispatch(fetchProjectChallengeActions(projectId)),
  fetchProjectManagers: projectId =>
    dispatch(fetchProjectManagers(projectId)),
  addProjectManager: (projectId, username, groupType) =>
    dispatch(addProjectManager(projectId, username, groupType)),
  setProjectManagerGroupType: (projectId, osmUserId, groupType) =>
    dispatch(setProjectManagerPermissions(projectId, osmUserId, groupType)),
  removeProjectManager: (projectId, osmUserId) =>
    dispatch(removeProjectManager(projectId, osmUserId)),
  deleteProject: (projectId, immediate=false) =>
    dispatch(deleteProject(projectId, immediate)),
  notManagerError: () => dispatch(addError(AppErrors.project.notManager)),
})

export default (WrappedComponent, options) =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithCurrentUser(WithCurrentProject(WrappedComponent, options)))
