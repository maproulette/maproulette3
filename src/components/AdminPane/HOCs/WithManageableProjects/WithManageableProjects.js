import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _values from 'lodash/values'
import _omit from 'lodash/omit'
import { fetchManageableProjects } from '../../../../services/Project/Project'
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
    }

    componentWillMount() {
      this.props.fetchManageableProjects().then(() =>
        this.setState({loadingProjects: false})
      )
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
                               challenges={manageableChallenges}
                               loadingProjects={this.state.loadingProjects} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities
})

const mapDispatchToProps = dispatch => ({
  fetchManageableProjects: () => dispatch(fetchManageableProjects()),
})

export default (WrappedComponent, includeChallenges) =>
  connect(mapStateToProps, mapDispatchToProps)(
    WithCurrentUser(WithManageableProjects(WrappedComponent, includeChallenges))
  )
