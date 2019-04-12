import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _get from 'lodash/get'
import _find from 'lodash/find'
import _omit from 'lodash/omit'
import _toNumber from 'lodash/toNumber'
import { loadUserSettings,
         updateUserSettings,
         updateNotificationSubscriptions,
         resetAPIKey } from '../../../services/User/User'
import WithCurrentUser from '../WithCurrentUser/WithCurrentUser'

/**
 * WithUser passes down the user from the redux store that is matches
 * the userId parameter. This id could either be the internal id,
 * the username, or the osm id. The current user making the request
 * must be a super user otherwise only the current user is accessible.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithTargetUser = function(WrappedComponent) {
  return class extends Component {
    state = {
      currentUser: null,
      targetUser: null,
    }

    targetUserId = props => _get(props, 'match.params.userId')

    loadTargetUser = props => {
      if (!this.state.currentUser || !this.state.currentUser.isSuperUser) {
        return
      }

      const targetUserId = this.targetUserId(props)

      if (targetUserId) {
        this.setState({showingUserId: targetUserId, loading: true})

        this.props.loadUserSettings(targetUserId).then(() => {
          this.setState({loading: false})
        })
      }
      else if (this.state.showingUserId != null) {
        this.setState({showingUserId: null, targetUser: null})
      }
    }

    getTargetUser = (props) => {
      let targetUser = props.user

      targetUser = _find(props.allUsers, (user) => {
                     return user.id === _toNumber(this.state.showingUserId)
                   })

      if (!targetUser) {
        targetUser = _find(props.allUsers, (user) => {
         return _get(user, 'osmProfile.id') === _toNumber(this.state.showingUserId)
        })
      }

      if (!targetUser) {
       targetUser = _find(props.allUsers, (user) => {
         return _get(user, 'osmProfile.displayName') === this.state.showingUserId
       })
      }

      return targetUser
    }

    componentDidMount() {
      this.loadTargetUser(this.props)
    }

    componentDidUpdate(prevProps) {
      // Load current user so we can check permissions
      if (!this.state.currentUser && this.props.user) {
        this.setState({currentUser: this.props.user})
        this.loadTargetUser(this.props)
      }

      // Only reload target user if user id changes
      if (this.targetUserId(this.props) !== this.state.showingUserId) {
        this.loadTargetUser(this.props)
      }
    }

    render() {
      return <WrappedComponent {..._omit(this.props, ['allUsers'])}
                               targetUser={this.getTargetUser(this.props)}
                               showingUserId={this.state.showingUserId}
                               loading={this.state.loading} />
    }
  }
}

export const mapStateToProps = state => {
  return {allUsers: _get(state, "entities.users"),
          currentUser: _get(state, "currentUser")}
}

export const mapDispatchToProps = dispatch => {
  const actions = bindActionCreators({
    loadUserSettings,
    updateUserSettings,
    updateNotificationSubscriptions,
    resetAPIKey,
  }, dispatch)

  return actions
}

export default (WrappedComponent) =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithCurrentUser(WithTargetUser(WrappedComponent)))
