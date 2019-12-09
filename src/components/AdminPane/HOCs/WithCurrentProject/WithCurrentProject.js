import React, { Component } from 'react'
import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _isObject from 'lodash/isObject'
import _values from 'lodash/values'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _omit from 'lodash/omit'
import _map from 'lodash/map'
import _sortBy from 'lodash/sortBy'
import _each from 'lodash/each'
import { fetchProject,
         fetchProjectActivity,
         fetchProjectsById } from '../../../../services/Project/Project'
import { challengeDenormalizationSchema,
         fetchProjectChallenges,
         fetchProjectChallengeActions,
         fetchLatestProjectChallengeActivity,
         fetchProjectChallengeComments }
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
 * - includeComments
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

    challengeProjects = (projectId, props) => {
      const allChallenges = _values(_get(this.props, 'entities.challenges', {}))
      return _filter(allChallenges, (challenge) => {
                      return challenge.parent === projectId ||
                        _find(challenge.virtualParents, (vp) => {
                          return (_isObject(vp) ? vp.id === projectId : vp === projectId)
                        })
                    })
    }

    loadProject = props => {
      if (props.loadingProjects) {
        return
      }

      let projectId = this.currentProjectId(props)

      if (_isFinite(this.routedProjectId(props)) && projectId === null &&
          !this.state.loadingProject) {
        this.props.notManagerError()
        props.history.push('/admin/projects')
        return
      }

      if (projectId === null) {
        projectId = this.routedProjectId(props)
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

          if (!options.includeActivity) {
            this.setState({loadingProject: false})
          }
          else {
            // Used for daily heatmap
            let activityStartDate = new Date(project.created)

            const challenges = _sortBy(this.challengeProjects(projectId, props), ['created'])
            const earliestChallenge = challenges.pop()
            if (earliestChallenge) {
              activityStartDate = earliestChallenge.created
            }

            props.fetchProjectActivity(projectId, activityStartDate).then(() =>
              this.setState({loadingProject: false})
            )
          }
        })

        if (options.includeChallenges) {
          const retrievals = []
          retrievals.push(props.fetchProjectChallenges(projectId).then(result => {
            // If the current project is a virtual project then it's possible
            // the child challenges have parent projects that haven't been
            // fetched yet. We need to fetch those so we can show their names.
            const missingProjects = []
            _each(_get(result, 'entities.challenges'), (challenge) => {
              if (!_isObject(challenge.parent)) {
                if (!this.props.entities.projects[challenge.parent]) {
                  missingProjects.push(challenge.parent)
                }
              }
            })
            if (missingProjects.length > 0) {
              this.props.fetchProjectsById(missingProjects)
            }
          }))

          if (options.includeActivity) {
            // Used to display completion progress for each challenge
            retrievals.push(props.fetchProjectChallengeActions(projectId))

            // Used to display latest activity for each challenge
            retrievals.push(props.fetchLatestProjectChallengeActivity(projectId))
          }

          if (options.includeComments) {
            retrievals.push(props.fetchProjectChallengeComments(projectId))
          }

          Promise.all(retrievals).then(() => {
            this.setState({loadingChallenges: false})
          })
        }
      }
      else {
        this.setState({loadingProject: false, loadingChallenges: false})
      }
    }

    componentDidMount() {
      this.loadProject(this.props)
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.loadingProjects && !nextProps.loadingProjects) {
        this.loadProject(nextProps)
        return
      }

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
        challenges = _map(this.challengeProjects(projectId, this.props), challenge =>
          denormalize(challenge, challengeDenormalizationSchema(), this.props.entities)
        )
      }

      return <WrappedComponent {..._omit(this.props, ['entities',
                                                      'notManagerError',
                                                      'fetchProject',
                                                      'fetchProjectChallenges'])}
                               project={project}
                               challenges={challenges}
                               activity={options.includeActivity ? _get(project, 'activity') : undefined}
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
  fetchProjectChallenges: projectId =>
    dispatch(fetchProjectChallenges(projectId, -1)),
  fetchLatestProjectChallengeActivity: projectId =>
    dispatch(fetchLatestProjectChallengeActivity(projectId)),
  fetchProjectChallengeActions: projectId =>
    dispatch(fetchProjectChallengeActions(projectId)),
  fetchProjectChallengeComments: projectId =>
    dispatch(fetchProjectChallengeComments(projectId)),
  fetchProjectsById: projectIds =>
    dispatch(fetchProjectsById(projectIds)),
  notManagerError: () => dispatch(addError(AppErrors.project.notManager)),
})

export default (WrappedComponent, options) =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithCurrentUser(WithCurrentProject(WrappedComponent, options)))
