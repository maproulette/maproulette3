import React, { Component } from 'react'
import { FormattedMessage, FormattedDate, injectIntl }
       from 'react-intl'
import _get from 'lodash/get'
import UserSettings from './UserSettings/UserSettings'
import WithTargetUser from '../../components/HOCs/WithTargetUser/WithTargetUser'
import SignInButton from '../../components/SignInButton/SignInButton'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import ApiKey from './ApiKey'
import messages from './Messages'
import AsAvatarUser from '../../interactions/User/AsAvatarUser'

class Profile extends Component {
  componentDidMount() {
    // Make sure our user is logged in
    if (_get(this.props, 'user.isLoggedIn')) {
      this.props.fetchUser(this.props.user.id)
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

    let user = this.props.user
    let osmProfile = AsAvatarUser(user.osmProfile)

    if (this.props.showingUserId) {
      user = this.props.targetUser

      // If no user then we are still loading
      if (!user) {
        if (this.props.loading) {
          return (
            <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
              <BusySpinner />
            </div>
          )
        }
        else {
          // User supplied was not found so we will user our current user
          return (
            <div className="">
              <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
                <h2><FormattedMessage {...messages.userNotFound} /></h2>
              </div>
            </div>
          )
        }
      }
    }

    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 lg:mr-py-20">
        <div className="mr-max-w-2xl mr-mx-auto mr-bg-white mr-p-4 md:mr-p-8 mr-rounded">
          <header className="mr-max-w-xs mr-mx-auto mr-text-center">
            <img
              className="mr-block mr-mx-auto mr-mb-4 mr-rounded-full md:mr-w-32 md:mr-h-32 md:mr--mt-23"
              src={osmProfile.profilePic(128)}
              srcSet={`${osmProfile.profilePic(128)} 1x, ${osmProfile.profilePic(256)} 2x"`}
              alt={osmProfile.displayName}
            />
            <h1 className="mr-h3 mr-text-blue mr-mb-1">{osmProfile.displayName}</h1>
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

          <UserSettings {...this.props} user={user} editor={this.props.user}/>
          <ApiKey {...this.props} user={user} />
        </div>
      </div>
    )
  }
}

export default WithTargetUser(injectIntl(Profile))
