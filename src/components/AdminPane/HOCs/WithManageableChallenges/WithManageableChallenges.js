import React, { Component } from 'react'
import { connect } from 'react-redux'
import { get as _get,
         map as _map,
         take as _take,
         values as _values,
         omit as _omit } from 'lodash'
import { fetchManageableProjects } from '../../../../services/Project/Project'
import { fetchProjectChallenges } from '../../../../services/Challenge/Challenge'
import WithCurrentUser from '../../../HOCs/WithCurrentUser/WithCurrentUser'
import AsManager from '../../../../services/User/AsManager'

/**
 * WithManageableChallenges makes available to the WrappedComponent all
 * challenges the given user has permission to manage, as well as their
 * parent projects.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const _WithManageableChallenges = function(WrappedComponent) {
  return class extends Component {
    state = {
      loadingProjects: true,
      loadingChallenges: true,
    }

    componentDidMount() {
      this.props.fetchManageableProjects().then(() => {
        this.setState({loadingProjects: false})
        const manager = new AsManager(this.props.user)

        const manageableProjects =
          manager.manageableProjects(_values(_get(this.props, 'entities.projects')))

        const challengePromises = _map(_take(manageableProjects, 10), project =>
          this.props.fetchProjectChallenges(project.id))

        Promise.all(challengePromises).then(() =>
          this.setState({loadingChallenges: false}))
      })
    }

    render() {
      const manager = new AsManager(this.props.user)

      const manageableProjects =
        manager.manageableProjects(_values(_get(this.props, 'entities.projects')))

      const manageableChallenges =
        manager.manageableChallenges(manageableProjects,
                                     _values(_get(this.props, 'entities.challenges')))

      return <WrappedComponent projects={manageableProjects}
                               challenges={manageableChallenges}
                               loadingProjects={this.state.loadingProjects}
                               loadingChallenges={this.state.loadingProjects}
                               {..._omit(this.props, ['entities'])} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities
})

const mapDispatchToProps = dispatch => ({
  fetchManageableProjects: () => dispatch(fetchManageableProjects()),
  fetchProjectChallenges: projectId =>
    dispatch(fetchProjectChallenges(projectId)), })

const WithManageableChallenges = WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(
    WithCurrentUser(_WithManageableChallenges(WrappedComponent))
  )

export default WithManageableChallenges

