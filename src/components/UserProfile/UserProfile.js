import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import MediaQuery from 'react-responsive'
import _get from 'lodash/get'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import Tabs from '../Bulma/Tabs'
import UserActivityTimeline
       from '../ActivityTimeline/UserActivityTimeline/UserActivityTimeline'
import SignInButton from '../SignInButton/SignInButton'
import PersonalInfo from './PersonalInfo'
import ApiKey from './ApiKey'
import SavedTasks from './SavedTasks/SavedTasks'
import SavedChallenges from './SavedChallenges/SavedChallenges'
import TopChallenges from './TopChallenges/TopChallenges'
import UserSettings from './UserSettings/UserSettings'
import messages from './Messages'
import './UserProfile.css'

export class UserProfile extends Component {
  render() {
    if (!_get(this.props, 'user.isLoggedIn')) {
      return (
        <div className="user-profile">
          <SignInButton className="user-profile--signin" {...this.props} />
        </div>
      )
    }

    const mobileTabs = {
      [this.props.intl.formatMessage(messages.overviewTab)]: (
        <div>
          <TopChallenges {...this.props} className="profile-section"/>
          <SavedChallenges {...this.props} className="profile-section" />
          <SavedTasks {...this.props} className="profile-section" />
        </div>),

      [this.props.intl.formatMessage(messages.activityTab)]: (
        <div>
          <UserActivityTimeline activity={this.props.user.activity}
                                className="user-profile__activity profile-section"/>
        </div>),

      [this.props.intl.formatMessage(messages.settingsTab)]: (
        <div>
          <UserSettings {...this.props} className="profile-section" />
          <ApiKey {...this.props} />
        </div>),
    }

    return (
      <div className="user-profile">
        <MediaQuery query="(min-width: 1024px)">
          <div className="columns">
            <div className="column is-two-fifths left-column">
              <PersonalInfo {...this.props} className="profile-section" />
              <UserActivityTimeline activity={this.props.user.activity}
                                    className="user-profile__activity profile-section"/>
            </div>

            <div className="column right-column">
              <TopChallenges {...this.props} className="profile-section"/>
              <SavedChallenges {...this.props} className="profile-section" />
              <SavedTasks {...this.props} className="profile-section" />
              <UserSettings {...this.props} className="profile-section" />
              <ApiKey {...this.props} />
            </div>
          </div>
        </MediaQuery>

        <MediaQuery query="(max-width: 1023px)">
          <PersonalInfo {...this.props} className="profile-section" />
          <Tabs className='is-centered' tabs={mobileTabs} />
        </MediaQuery>
      </div>
    )
  }
}

export default WithCurrentUser(injectIntl(UserProfile))
