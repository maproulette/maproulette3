import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { get as _get } from 'lodash'
import DropdownButton from '../../Bulma/DropdownButton'
import SignInButton from '../../SignInButton/SignInButton'
import WithDeactivateOnOutsideClick
       from '../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import messages from './Messages'
import './AccountNavItem.css'

// constants for dropdown-menu control keys
const SIGNOUT = 'signout'
const PROFILE = 'profile'

// Setup child components with needed HOCs.
const DeactivatableDropdownButton =
  WithDeactivateOnOutsideClick(DropdownButton)

/**
 * AccountNavItem renders the user's OSM avatar and a drop-down menu with
 * user-account controls, such as sign-out, if the user is logged in.
 * If the user is not logged in, it simply presents a sign-in button.
 * Authentication occurs via oauth with OSM and is managed by the server.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class AccountNavItem extends Component {
  chooseAccountOption = ({value}) => {
    switch(value) {
      case PROFILE:
        this.props.history.push('/user/profile')
        break
      case SIGNOUT:
        this.props.logoutUser()
        break
      default:
        throw new Error("unrecognized-option",
                        "Unrecognized account option.")
    }
  }

  render() {
    if (!_get(this.props, 'user.isLoggedIn')) {
      return (
        <div className="navbar-item navbar__account-nav-item">
          <SignInButton className="white-on-green navbar__account-nav-item__signin"
                        {...this.props} />
        </div>
      )
    }

    const accountOptions = [
      {
        key: PROFILE,
        text: this.props.intl.formatMessage(messages.profile),
        value: PROFILE,
      },
      {
        key: SIGNOUT,
        text: this.props.intl.formatMessage(messages.signout),
        value: SIGNOUT
      }
    ]

    return (
      <div className="navbar-item navbar__account-nav-item signed-in">
        <DeactivatableDropdownButton options={accountOptions}
                                     onSelect={this.chooseAccountOption}
                                     className='is-right navbar__account-nav-item__dropdown'>
          <figure className="navbar__account-nav-item__avatar image is-48x48">
            <img className="is-circular"
                  src={this.props.user.osmProfile.avatarURL}
                  alt="Avatar" />
          </figure>

          <span className="navbar__account-nav-item__username">
            {this.props.user.osmProfile.displayName}
          </span>
          <div className="navbar__account-nav-item__icon" />
        </DeactivatableDropdownButton>
      </div>
    )
  }
}

AccountNavItem.propTypes = {
  /** Logged-in user, if available */
  user: PropTypes.object,
  /** Invoked when the user wishes to logout */
  logoutUser: PropTypes.func.isRequired,
}

export default injectIntl(AccountNavItem)
