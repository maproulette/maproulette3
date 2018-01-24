import React, { Component } from 'react'
import { connect } from 'react-redux'
import { get as _get,
         omit as _omit } from 'lodash'
import { fetchProject,
         saveProject } from '../../../../services/Project/Project'

/**
 * WithCurrentProject makes available to the WrappedComponent the current
 * project from the route as well as relevant edit functions.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithCurrentProject = function(WrappedComponent) {
  return class extends Component {
    state = {
      loading: true,
    }

    componentDidMount() {
      const projectId = parseInt(_get(this.props, 'match.params.projectId'), 10)

      if (!isNaN(projectId)) {
        this.props.fetchProject(projectId).then(() => {
          this.setState({loading: false})
        })
      }
      else {
        this.setState({loading: false})
      }
    }

    render() {
      const projectId = parseInt(_get(this.props, 'match.params.projectId'), 10)
      const project = isNaN(projectId) ? null :
                      _get(this.props, `entities.projects.${projectId}`)

      return <WrappedComponent key={projectId}
                               project={project}
                               loading={this.state.loading}
                               {..._omit(this.props, ['entities', 'fetchProject'])} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities,
})

const mapDispatchToProps = dispatch => ({
  fetchProject: projectId => dispatch(fetchProject(projectId)),
  saveProject: projectData => dispatch(saveProject(projectData)),
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithCurrentProject(WrappedComponent))
