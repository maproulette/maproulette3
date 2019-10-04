import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _get from 'lodash/get'
import _find from 'lodash/find'
import _omit from 'lodash/omit'
import _toNumber from 'lodash/toNumber'
import _cloneDeep from 'lodash/cloneDeep'
import queryString from 'query-string'
import { loadUserSettings,
         updateUserSettings,
         updateNotificationSubscriptions,
         resetAPIKey } from '../../../services/User/User'
import WithCurrentUser from '../WithCurrentUser/WithCurrentUser'

/**
 * WithTargetUser passes down the user from the redux store that matches
 * the userId parameter from the url. This id could either be the internal id,
 * the username, or the osm id. The current user making the request
 * must be a super user otherwise only the current user is accessible.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithTargetUser = function(WrappedComponent, limitToSuperUsers) {
  return class extends Component {
    state = {
      currentUser: null,
      targetUser: null,
    }

    getTargetUserId = props => _get(props, 'match.params.userId')

    loadTargetUser = props => {
      if ((!_get(this.state.currentUser, 'isSuperUser')) && limitToSuperUsers) {
        return
      }

      const targetUserId = this.getTargetUserId(props)

      if (targetUserId) {
        this.setState({showingUserId: targetUserId, loading: true})

        if (this.state.currentUser && (this.state.currentUser.id === targetUserId || this.state.currentUser.isSuperUser)) {
          this.props.loadUserSettings(targetUserId).then(() => {
            this.setState({loading: false})
          })
        }
        else {
          this.props.fetchBasicUser(targetUserId).then(() => {
            this.setState({loading: false})
          })
        }
      }
      else if (this.state.showingUserId != null) {
        this.setState({showingUserId: null, targetUser: null})
      }
    }

    getTargetUser = (props) => {
      let targetUser = _find(props.allUsers, (user) => {
                     return user.id === _toNumber(this.state.showingUserId)
                   })

      if (!targetUser) {
        targetUser = _find(props.allUsers, (user) => {
         return _get(user, 'osmProfile.id') === _toNumber(this.state.showingUserId)
        })
      }

      if (!targetUser) {
       targetUser = _find(props.allUsers, (user) => {
         return (_get(user, 'osmProfile.displayName') || '').toLowerCase() ===
                    (_get(this.state, 'showingUserId') || '').toLowerCase()
       })
      }

      if (!targetUser && !this.state.showingUserId) {
        targetUser = props.user
      }

      const avatarURL = _get(targetUser, 'osmProfile.avatarURL')
      if (avatarURL && avatarURL.indexOf('?') !== -1) {
        const avatarUrlBase = avatarURL.substring(avatarURL.indexOf('?'), 0)
        const avatarUrlParams = avatarURL.substring(avatarURL.indexOf('?') + 1)
        let parsedAvatarURLparams = queryString.parse(avatarUrlParams)
        parsedAvatarURLparams = _omit(parsedAvatarURLparams, ['s']) // omit size param coming from server and use `&s={size}` in requests
        const newAvatarUrl = `${avatarUrlBase}?${queryString.stringify(parsedAvatarURLparams)}`
        targetUser = _cloneDeep(targetUser)
        targetUser.osmProfile.avatarURL = newAvatarUrl
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
      if (this.getTargetUserId(this.props) !== this.state.showingUserId) {
        this.loadTargetUser(this.props)
      }
    }

    render() {
      const targetUser = this.getTargetUser(this.props)

      return <WrappedComponent {..._omit(this.props, ['allUsers'])}
                               targetUser={targetUser}
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

export default (WrappedComponent, limitToSuperUsers = true) =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithCurrentUser(WithTargetUser(WrappedComponent, limitToSuperUsers)))
