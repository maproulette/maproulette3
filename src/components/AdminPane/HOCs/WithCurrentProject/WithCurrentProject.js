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
         saveProject,
         deleteProject} from '../../../../services/Project/Project'
import { fetchProjectChallenges,
         fetchProjectChallengeActions }
       from '../../../../services/Challenge/Challenge'
import AppErrors from '../../../../services/Error/AppErrors'
import { addError } from '../../../../services/Error/Error'

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

    updateProject = props => {
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

          if (options.includeActivity) {
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
            retrievals.push(props.fetchProjectChallengeActions(projectId))
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
      this.updateProject(this.props)
    }

    componentWillReceiveProps(nextProps) {
      const nextProjectId = this.routedProjectId(nextProps)

      if ( _isFinite(nextProjectId) &&
           nextProjectId !== this.routedProjectId(this.props)) {
        this.updateProject(nextProps)
      }
    }

    render() {
      const projectId = this.currentProjectId(this.props)
      const project = !_isFinite(projectId) ? null :
                      _get(this.props, `entities.projects.${projectId}`)
      let challenges = []

      if (options.includeChallenges) {
        const allChallenges = _values(_get(this.props, 'entities.challenges', {}))
        challenges = _filter(allChallenges, {parent: projectId})
      }

      return <WrappedComponent project={project}
                               challenges={challenges}
                               routedProjectId={this.routedProjectId(this.props)}
                               loadingProject={this.state.loadingProject}
                               loadingChallenges={this.state.loadingChallenges}
                               {..._omit(this.props, ['entities',
                                                      'notManagerError',
                                                      'fetchProject',
                                                      'fetchProjectChallenges'])} />
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
    dispatch(fetchProjectChallenges(projectId)),
  fetchProjectChallengeActions: projectId =>
    dispatch(fetchProjectChallengeActions(projectId)),
  deleteProject: (projectId, immediate=false) =>
    dispatch(deleteProject(projectId, immediate)),
  notManagerError: () => dispatch(addError(AppErrors.project.notManager)),
})

export default (WrappedComponent, options) =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithCurrentProject(WrappedComponent, options))
