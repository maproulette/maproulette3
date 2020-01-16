import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _omit from 'lodash/omit'
import _isObject from 'lodash/isObject'
import _values from 'lodash/values'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import { isUsableChallengeStatus }
       from '../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { fetchProject } from '../../../services/Project/Project'
import { fetchProjectChallenges,
         fetchProjectChallengeActions }
       from '../../../services/Challenge/Challenge'


/**
 * WithProject makes available to the WrappedComponent the
 * project from the route with it's challenges.
 *
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithProject = function(WrappedComponent, options={}) {
  return class extends Component {
    state = {
      project: null,
      loadingChallenges: options.includeChallenges,
    }

    currentProjectId = props =>
      parseInt(_get(props, 'match.params.projectId'), 10)

      challengeProjects = (projectId, props) => {
        const allChallenges = _values(_get(this.props, 'entities.challenges', {}))
        return _filter(allChallenges, (challenge) => {
            const matchingVP =
              _find(challenge.virtualParents, (vp) => {
                return (_isObject(vp) ? vp.id === projectId : vp === projectId)
              })

            return ((challenge.parent === projectId || matchingVP)
                    && challenge.enabled
                    && isUsableChallengeStatus(challenge.status))
          })
      }

    loadProject = props => {
      const projectId = this.currentProjectId(props)

      if (_isFinite(projectId) && !this.state.project) {
        this.setState({
          loadingChallenges: options.includeChallenges,
        })

        props.fetchProject(projectId).then(normalizedProject => {
          const project = normalizedProject.entities.projects[normalizedProject.result]
          this.setState({project: project})

          if (options.includeChallenges) {
            const retrievals = []
            retrievals.push(props.fetchProjectChallenges(projectId))

            // Used to display completion progress for each challenge
            retrievals.push(props.fetchProjectChallengeActions(projectId))

            Promise.all(retrievals).then(() => {
              this.setState({loadingChallenges: false})
            })
          }

        })
      }
    }

    componentWillMount() {
      this.loadProject(this.props)
    }

    componentWillReceiveProps(nextProps) {
      this.loadProject(nextProps)
    }

    render() {
      let challenges = this.props.challenges // pass through challenges by default

      if (options.includeChallenges && this.state.project) {
        challenges = this.challengeProjects(this.state.project.id, this.props)
      }

      return <WrappedComponent {..._omit(this.props, ['fetchProject',
                                                      'fetchProjectChallenges',
                                                      'fetchProjectChallengeActions'])}
                               project={this.state.project}
                               challenges={challenges} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities,
})

const mapDispatchToProps = dispatch => ({
  fetchProject: projectId => dispatch(fetchProject(projectId)),
  fetchProjectChallenges: projectId =>
    dispatch(fetchProjectChallenges(projectId, -1)),
  fetchProjectChallengeActions: projectId =>
    dispatch(fetchProjectChallengeActions(projectId)),
})

export default (WrappedComponent, options) =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithProject(WrappedComponent, options))
