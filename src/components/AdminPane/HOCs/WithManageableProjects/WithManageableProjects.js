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
const WithManageableProjects = function(WrappedComponent) {
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

      return <WrappedComponent projects={manageableProjects}
                               loadingProjects={this.state.loadingProjects}
                               {..._omit(this.props, ['entities',
                                                      'fetchManageableProjects'])} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities
})

const mapDispatchToProps = dispatch => ({
  fetchManageableProjects: () => dispatch(fetchManageableProjects()),
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(
    WithCurrentUser(WithManageableProjects(WrappedComponent))
  )
