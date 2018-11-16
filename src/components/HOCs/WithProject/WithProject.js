import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _omit from 'lodash/omit'
import { fetchProject } from '../../../services/Project/Project'

/**
 * WithProject makes available to the WrappedComponent the
 * project from the route with it's challenges.
 *
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithProject = function(WrappedComponent) {
  return class extends Component {
    state = {
      project: null,
    }

    currentProjectId = props =>
      parseInt(_get(props, 'match.params.projectId'), 10)

    loadProject = props => {
      const projectId = this.currentProjectId(props)

      if (_isFinite(projectId) && !this.state.project) {
        props.fetchProject(projectId).then(normalizedProject => {
          const project = normalizedProject.entities.projects[normalizedProject.result]
          this.setState({project: project})
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
      return <WrappedComponent {..._omit(this.props, ['fetchProject'])}
                               project={this.state.project} />
    }
  }
}

const mapStateToProps = state => ({
})

const mapDispatchToProps = dispatch => ({
  fetchProject: projectId => dispatch(fetchProject(projectId)),
})

export default (WrappedComponent, options) =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithProject(WrappedComponent, options))
