import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _get from 'lodash/get'
import _values from 'lodash/values'
import _omit from 'lodash/omit'
import { fetchManageableProjects,
         addProjectManager,
         setProjectManagerGroupType,
         fetchProjectManagers,
         removeProjectManager,
         saveProject,
         removeProject,
         deleteProject} from '../../../../services/Project/Project'
import { fetchProjectChallengeListing }
       from '../../../../services/Challenge/Challenge'
import WithCurrentUser from '../../../HOCs/WithCurrentUser/WithCurrentUser'
import AsManager from '../../../../interactions/User/AsManager'

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

    componentWillMount() {
      this.props.fetchManageableProjects().then(({result}) => {
        if (includeChallenges) {
          this.props.fetchProjectChallengeListing(result).then(() => {
            this.setState({loadingChallenges: false})
          })
        }

        this.setState({loadingProjects: false})
      })
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
    fetchProjectChallengeListing,
    saveProject,
    addProjectManager,
    fetchProjectManagers,
    setProjectManagerGroupType,
    removeProjectManager,
  }, dispatch)

  actions.deleteProject = (projectId, immediate=false) => {
    // Optimistically remove the project.
    dispatch(removeProject(projectId))
    return dispatch(deleteProject(projectId, immediate))
  }

  return actions
}

export default (WrappedComponent, includeChallenges) =>
  connect(mapStateToProps, mapDispatchToProps)(
    WithCurrentUser(WithManageableProjects(WrappedComponent, includeChallenges))
  )
