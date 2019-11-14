import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _get from 'lodash/get'
import _values from 'lodash/values'
import _omit from 'lodash/omit'
import _each from 'lodash/each'
import _isEqual from 'lodash/isEqual'
import { RESULTS_PER_PAGE } from '../../../../services/Search/Search'
import { fetchManageableProjects,
         fetchProject,
         fetchProjectsById,
         addProjectManager,
         setProjectManagerGroupType,
         fetchProjectManagers,
         removeProjectManager,
         saveProject,
         removeProject,
         deleteProject} from '../../../../services/Project/Project'
import { addChallenge,
         removeChallenge } from '../../../../services/Project/VirtualProject'
import { fetchProjectChallengeListing }
       from '../../../../services/Challenge/Challenge'
import WithCurrentUser from '../../../HOCs/WithCurrentUser/WithCurrentUser'
import AsManager from '../../../../interactions/User/AsManager'
import WithPinned from '../../HOCs/WithPinned/WithPinned'
import WithTallied from '../../HOCs/WithTallied/WithTallied'

/**
 * WithManageableProjects makes available to the WrappedComponent all the
 * projects the given user has permission to manage.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithManageableProjects = function(WrappedComponent, includeChallenges=false) {
  return class extends Component {
    state = {
      loadingProjects: true,
      loadingChallenges: includeChallenges,
    }

    getProjectFilters(props) {
      return _get(props, 'currentConfiguration.filters.projectFilters', {})
    }

    loadProjects() {
      const filters = this.getProjectFilters(this.props)

      this.props.fetchManageableProjects(null, RESULTS_PER_PAGE, filters.owner, filters.visible).then(({result}) => {
        if (includeChallenges) {
          this.props.fetchProjectChallengeListing(result).then(() => {
            this.setState({loadingChallenges: false})
          })
        }

        // Since we only fetched a small portion of the total projects in the
        // database we need to make sure we also fetch the projects that are pinned.
        let missingProjects = []
        _each(this.props.pinnedProjects, (pinnedProject) => {
          if (!this.props.entities.projects[pinnedProject]) {
            missingProjects.push(pinnedProject)
          }
        })
        if (missingProjects.length > 0) {
          this.props.fetchProjectsById(missingProjects)

          if (includeChallenges) {
            this.props.fetchProjectChallengeListing(missingProjects).then(() => {
              this.setState({loadingChallenges: false})
            })
          }
        }

        this.setState({loadingProjects: false})
      })
    }

    componentDidMount() {
      this.loadProjects()
    }

    componentDidUpdate(prevProps, prevState) {
      if (!_isEqual(this.getProjectFilters(this.props),
                    this.getProjectFilters(prevProps))) {
        this.loadProjects()
      }
    }

    render() {
      const manager = AsManager(this.props.user)

      const manageableProjects =
        manager.manageableProjects(_values(_get(this.props, 'entities.projects')))

      let manageableChallenges = []
      if (includeChallenges) {
        manageableChallenges = manager.manageableChallenges(
          manageableProjects,
          _values(_get(this.props, 'entities.challenges'))
        )
      }

      return <WrappedComponent {..._omit(this.props, ['entities',
                                                      'fetchManageableProjects'])}
                               projects={manageableProjects}
                               managesSingleProject={manageableProjects.length === 1}
                               challenges={manageableChallenges}
                               loadingProjects={this.state.loadingProjects}
                               loadingChallenges={this.state.loadingChallenges} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities
})

const mapDispatchToProps = dispatch => {
  const actions = bindActionCreators({
    fetchManageableProjects,
    fetchProject,
    fetchProjectsById,
    fetchProjectChallengeListing,
    saveProject,
    addProjectManager,
    fetchProjectManagers,
    setProjectManagerGroupType,
    removeProjectManager,
    addChallenge,
    removeChallenge,
  }, dispatch)

  actions.deleteProject = (projectId, immediate=false) => {
    // Optimistically remove the project.
    dispatch(removeProject(projectId))
    return dispatch(deleteProject(projectId, immediate))
  }

  actions.toggleProjectEnabled = project => {
    const updatedProject = Object.assign({}, project, {enabled: !project.enabled})
    return dispatch(saveProject(updatedProject))
  }

  return actions
}

export default (WrappedComponent, includeChallenges) =>
  connect(mapStateToProps, mapDispatchToProps)(
    WithCurrentUser(
      WithPinned(
        WithTallied(
          WithManageableProjects(WrappedComponent, includeChallenges))))
  )
