import React, { Component } from 'react'
import { FormattedMessage, FormattedDate, injectIntl }
       from 'react-intl'
import _get from 'lodash/get'
import _find from 'lodash/find'
import _toNumber from 'lodash/toNumber'
import UserSettings from './UserSettings/UserSettings'
import AsManager from '../../interactions/User/AsManager'
import WithCurrentUser from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import SignInButton from '../../components/SignInButton/SignInButton'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import ApiKey from './ApiKey'
import messages from './Messages'

class Profile extends Component {
  state = {
    showingUserId: null,
  }

  componentDidMount() {
    // Make sure our user is logged in
    if (_get(this.props, 'user.isLoggedIn')) {
      this.props.fetchUser(this.props.user.id)
    }

    // If there is a user id on the url then we want to show
    // that user instead (but only if our current user is a super user)
    if (this.props.match.params.userId) {
      if (AsManager(this.props.user).isSuperUser()) {
        this.props.loadUserSettings(this.props.match.params.userId).then(() => {
          this.setState({loading: false})
        })
        this.setState({showingUserId: this.props.match.params.userId, loading: true})
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.userId && !this.state.showingUserId) {
      if (AsManager(this.props.user).isSuperUser()) {
        this.props.loadUserSettings(this.props.match.params.userId).then(() => {
          this.setState({loading: false})
        })
        this.setState({showingUserId: this.props.match.params.userId, loading: true})
      }
    }

    if (this.props.user && this.props.user.id !== _get(prevProps, 'user.id')) {
      if (this.props.user.isLoggedIn) {
        this.props.fetchUser(this.props.user.id)
      }
    }
  }

  render() {
    if (!this.props.user) {
      return (
        <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
          {this.props.checkingLoginStatus ?
           <BusySpinner /> :
           <SignInButton {...this.props} longForm />
          }
        </div>
      )
    }

    var user = this.props.user

    if (this.state.showingUserId) {
      user = _find(this.props.allUsers, (user) => {
        return user.id === _toNumber(this.state.showingUserId)
      })

      if (!user) {
        user = _find(this.props.allUsers, (user) => {
          return _get(user, 'osmProfile.id') === _toNumber(this.state.showingUserId)
        })
      }

      if (!user) {
        user = _find(this.props.allUsers, (user) => {
          return _get(user, 'osmProfile.displayName') === this.state.showingUserId
        })
      }

      // If no user then we are still loading
      if (!user) {
        if (this.state.loading) {
          return (
            <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
              <BusySpinner />
            </div>
          )
        }
        else {
          // User supplied was not found so we will user our current user
          user = this.props.user
        }
      }
    }

    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 lg:mr-py-20">
        <div className="mr-max-w-2xl mr-mx-auto mr-bg-white mr-p-4 md:mr-p-8 mr-rounded">
          <header className="mr-max-w-xs mr-mx-auto mr-text-center">
            <img
              className="mr-block mr-mx-auto mr-mb-4 mr-rounded-full md:mr-w-30 md:mr-h-30 md:mr--mt-23"
              src={`${user.osmProfile.avatarURL}?s=120`}
              srcSet={`${user.osmProfile.avatarURL}?s=120 1x, ${user.osmProfile.avatarURL}?s=240 2x"`}
              alt={user.osmProfile.displayName}
            />
            <h1 className="mr-h3 mr-text-blue mr-mb-1">{user.osmProfile.displayName}</h1>
            <p className="mr-text-grey mr-text-sm mr-font-mono">
              <FormattedMessage {...messages.userSince} /> <b>
                <FormattedDate
                  month='long'
                  year='numeric'
                  value={new Date(user.created)}
                />
              </b>
            </p>
          </header>

          <UserSettings {...this.props} user={user} />
          <ApiKey {...this.props} user={user} />
        </div>
      </div>
    )
  }
}

export default WithCurrentUser(injectIntl(Profile))
