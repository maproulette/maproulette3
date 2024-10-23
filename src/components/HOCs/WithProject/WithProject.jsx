import { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _omit from 'lodash/omit'
import _isObject from 'lodash/isObject'
import _values from 'lodash/values'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import { fetchProject } from '../../../services/Project/Project'
import { fetchProjectChallenges,
         fetchProjectChallengeActions }
       from '../../../services/Challenge/Challenge'
import { fetchBasicUser } from '../../../services/User/User'
import { PROJECT_CHALLENGE_LIMIT } from '../../../services/Project/Project'


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

    challengeProjects = (projectId) => {
      const allChallenges = _values(_get(this.props, 'entities.challenges', {}))
      return _filter(allChallenges, (challenge) => {
          const matchingVP =
            _find(challenge.virtualParents, (vp) => {
              return (_isObject(vp) ? vp.id === projectId : vp === projectId)
            })

          return ((challenge.parent === projectId || matchingVP)
                  && challenge.enabled)
        })
    }

    loadProject = async (props) => {
      const projectId = this.currentProjectId(props)

      if (_isFinite(projectId)) {
        this.setState({
          loadingChallenges: options.includeChallenges,
        })

        props.fetchProject(projectId)
          .then(async normalizedProject => {
            const project = normalizedProject.entities.projects[normalizedProject.result]
            this.setState({project: project})

            if (options.includeOwner) {
              let normalizedOwner = await props.fetchUser(project.owner);
              let owner = normalizedOwner.entities.users[normalizedOwner.result];
              this.setState({ owner })
            }

            if (options.includeChallenges) {
              const retrievals = []
              retrievals.push(props.fetchProjectChallenges(projectId))

              const challenges = await props.fetchProjectChallenges(projectId)

              if (challenges.result.length < PROJECT_CHALLENGE_LIMIT + 1) {
                retrievals.push(props.fetchProjectChallengeActions(projectId))
              }

              Promise.all(retrievals).then(() => {
                this.setState({loadingChallenges: false})
              })
            }
          })
          .catch(error => {
            // Handle any errors that occurred during project fetching
            console.error('Error fetching project:', error);
            this.setState({ loadingChallenges: false });
          });
      }
    }

    componentDidMount() {
      this.loadProject(this.props)
    }

    componentDidUpdate(prevProps) {
      if (this.currentProjectId(this.props) !== this.currentProjectId(prevProps)) {
        this.loadProject(this.props)
      }
    }

    render() {
      let challenges = this.props.challenges // pass through challenges by default

      if (options.includeChallenges && this.state.project) {
        challenges = this.challengeProjects(this.state.project.id, this.props)
      }

      let owner = this.props.owner
      if (options.includeOwner) {
        owner = this.state.owner
      }

      return <WrappedComponent {..._omit(this.props, ['fetchProject',
                                                      'fetchProjectChallenges',
                                                      'fetchProjectChallengeActions',
                                                      'fetchUser'])}
                               project={this.state.project}
                               owner={owner}
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
    dispatch(fetchProjectChallengeActions(projectId, false, false)),
  fetchUser: userId => dispatch(fetchBasicUser(userId)),
})

export default (WrappedComponent, options) =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithProject(WrappedComponent, options))
