import React, { Component } from 'react'
import { connect } from 'react-redux'
import { get as _get,
         values as _values,
         filter as _filter,
         omit as _omit } from 'lodash'
import { fetchProject,
         saveProject } from '../../../../services/Project/Project'
import { fetchProjectChallenges }
       from '../../../../services/Challenge/Challenge'

/**
 * WithCurrentProject makes available to the WrappedComponent the current
 * project from the route as well as relevant edit functions. Child
 * challenges can optionally be requested, which will be presented as
 * a challenges prop (not embedded within the project object).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithCurrentProject = function(WrappedComponent,
                                    includeChallenges=false,
                                    historicalMonths=2) {
  return class extends Component {
    state = {
      loadingProject: true,
      loadingChallenges: includeChallenges,
    }

    componentDidMount() {
      const projectId = parseInt(_get(this.props, 'match.params.projectId'), 10)

      if (!isNaN(projectId)) {
        this.props.fetchProject(projectId).then(() =>
          this.setState({loadingProject: false})
        )

        if (includeChallenges) {
          this.props.fetchProjectChallenges(projectId).then(() =>
            this.setState({loadingChallenges: false})
          )
        }
      }
      else {
        this.setState({loadingProject: false, loadingChallenges: false})
      }
    }

    render() {
      const projectId = parseInt(_get(this.props, 'match.params.projectId'), 10)
      const project = isNaN(projectId) ? null :
                      _get(this.props, `entities.projects.${projectId}`)
      let challenges = []

      if (includeChallenges) {
        const allChallenges = _values(_get(this.props, 'entities.challenges', {}))
        challenges = _filter(allChallenges, {parent: projectId})
      }

      return <WrappedComponent key={projectId}
                               project={project}
                               challenges={challenges}
                               loadingProject={this.state.loadingProject}
                               loadingChallenges={this.state.loadingChallenges}
                               {..._omit(this.props, ['entities',
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
  saveProject: projectData => dispatch(saveProject(projectData)),
  fetchProjectChallenges: projectId =>
    dispatch(fetchProjectChallenges(projectId)),
})

export default (WrappedComponent, includeChallenges, historicalMonths) =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithCurrentProject(WrappedComponent,
                                                 includeChallenges,
                                                 historicalMonths))
