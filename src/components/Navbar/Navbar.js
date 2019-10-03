import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { screens } from '../../tailwind'
import MobileMenu from 'react-burger-menu/lib/menus/slide'
import classNames from 'classnames'
import _get from 'lodash/get'
import { Link, NavLink } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import SignInButton from '../SignInButton/SignInButton'
import PointsTicker from '../PointsTicker/PointsTicker'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import Dropdown from '../Dropdown/Dropdown'
import messages from './Messages'
import './Navbar.scss'

/**
 * Navbar renders the primary top nav in the application, including the brand,
 * primary nav links, and user-account menu controls.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class Navbar extends Component {
  state = {
    mobileMenuOpen: false,
  }

  setMobileMenuState = state => {
    this.setState({mobileMenuOpen: state.isOpen})
  }

  closeMobileMenu = () => {
    this.setState({mobileMenuOpen: false})
  }

  toggleMobileMenu = () => {
    this.setState({mobileMenuOpen: !this.state.mobileMenuOpen})
  }

  signout = () => {
    this.props.logoutUser(_get(this.props, 'user.id'))
    this.closeMobileMenu()
  }

  render() {
    return (
      <header className="mr-relative mr-bg-gradient-r-green-blue mr-shadow mr-p-6 mr-flex mr-items-center mr-justify-between">
        <nav className="mr-flex mr-items-center">
          <Link to='/' rel="home" className="mr-text-white hover:mr-text-current">
            <SvgSymbol sym="mr-logo"
                       viewBox="0 0 174 40"
                       className="mr-block mr-fill-current mr-w-48 mr-h-auto"
             />
          </Link>
          <MediaQuery minWidth={screens.lg}>
            <div className="mr-ml-8 xl:mr-ml-12">
              <ol className="mr-list-nav-primary">
                <Nav {...this.props} closeMobileMenu={this.closeMobileMenu} />
              </ol>
            </div>
          </MediaQuery>
        </nav>
        <MediaQuery minWidth={screens.lg}>
          <LoggedInUser {...this.props}>
            <div className="mr-flex mr-items-center">
              <a href="/leaderboard">
                <PointsTicker user={this.props.user} className="mr-mr-8" />
              </a>
              <Dropdown
                className="mr-dropdown--right"
                dropdownButton={dropdown =>
                  <ProfileButton
                    {...this.props}
                    toggleDropdownVisible={dropdown.toggleDropdownVisible}
                  />
                }
                dropdownContent={dropdown =>
                  <ProfileMenu
                    {...this.props}
                    closeDropdown={dropdown.closeDropdown}
                  />
                }
              />
            </div>
          </LoggedInUser>

          <LoggedOutUser {...this.props}>
            <SignInButton className="white-on-green top-nav__signin-link"
                          {...this.props} />
          </LoggedOutUser>
        </MediaQuery>
        <MediaQuery maxWidth={screens.lg}>
          <MobileMenu
            right
            width={260}
            isOpen={this.state.mobileMenuOpen}
            onStateChange={this.setMobileMenuState}
            customBurgerIcon={false}
            customCrossIcon={
              <SvgSymbol
                sym="icon-close"
                viewBox="0 0 20 20"
                className="mr-fill-white mr-w-full mr-h-full"
              />
            }
            styles={{
              bmCrossButton: {
                top: 0,
                right: 0,
                height: '1.125rem',
                width: '1.125rem',
              },
              bmOverlay: {
                background: 'rgba(0, 0, 0, 0.5)',
              },
            }}
          >
            <MobileNav
              {...this.props}
              signout={this.signout}
              closeMobileMenu={this.closeMobileMenu}
            />
          </MobileMenu>

          <button
            className="mr-text-white"
            aria-label="Menu"
            onClick={this.toggleMobileMenu}
          >
            <SvgSymbol
              sym="icon-menu"
              viewBox="0 0 20 20"
              className="mr-w-6 mr-h-auto mr-fill-current"
            />
          </button>
        </MediaQuery>
      </header>
    )
  }
}

const ProfileButton = function(props) {
  return (
    <button className="mr-dropdown__button" onClick={props.toggleDropdownVisible}>
      <span className="mr-flex mr-items-center mr-text-white">
        <div className="mr-relative">
          <UnreadNotificationsIndicator {...props} />
          <ProfileImage {...props} />
        </div>

        <span className="mr-text-sm mr-mr-1 xl:mr-mr-2">
          {props.user.osmProfile.displayName}
        </span>
        <SvgSymbol
          sym="icon-cheveron-down"
          viewBox="0 0 20 20"
          className="mr-fill-current mr-w-5 mr-h-5"
        />
      </span>
    </button>
  )
}

const UnreadNotificationsIndicator = function(props) {
  if (!props.user.hasUnreadNotifications) {
    return null
  }

  return (
    <span
      className={classNames("mr-rounded-full mr-bg-red-light mr-text-white", {
                            "mr-absolute mr-pin-t mr-pin-l-50 mr-translate-x-1/2 mr-w-3 mr-h-3": !props.inline,
                            "mr-inline-block mr-ml-2 mr-w-2 mr-h-2": props.inline})}
    />
  )
}

const ProfileMenu = function(props) {
  return (
    <ol className="mr-list-dropdown">
      <li>
        <NavLink to="/inbox" onClick={props.closeDropdown}>
          <FormattedMessage {...messages.inbox} />
          <UnreadNotificationsIndicator {...props} inline />
        </NavLink>
      </li>
      <li>
        <NavLink to="/review" onClick={props.closeDropdown}>
          <FormattedMessage {...messages.review} />
        </NavLink>
      </li>
      <li>
        <NavLink to='/admin/projects' onClick={props.closeDropdown}>
          <FormattedMessage {...messages.adminCreate} />
        </NavLink>
      </li>
      <li>
        <NavLink to="/user/profile" onClick={props.closeDropdown}>
          <FormattedMessage {...messages.profile} />
        </NavLink>
      </li>
      <li>
        <NavLink to="/user/metrics" onClick={props.closeDropdown}>
          <FormattedMessage {...messages.metrics} />
        </NavLink>
      </li>
      <li>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a onClick={props.logoutUser}>
          <FormattedMessage {...messages.signout} />
        </a>
      </li>
    </ol>
  )
}

const ProfileImage = props => (
  <img
    className="mr-block mr-w-12 mr-h-12 mr-rounded-full mr-mr-2 xl:mr-mr-4"
    src={props.user.osmProfile.avatarURL}
    srcSet={`${props.user.osmProfile.avatarURL}?s=48 1x, ${props.user.osmProfile.avatarURL}?s=96 2x"`}
    alt=''
  />
)

const Nav = props => (
  <React.Fragment>
    <LoggedInUser {...props}>
      <li>
        <NavLink to="/dashboard" onClick={props.closeMobileMenu}>
          <FormattedMessage {...messages.dashboard} />
        </NavLink>
      </li>
    </LoggedInUser>

    <li>
      <NavLink to='/browse/challenges' onClick={props.closeMobileMenu}>
        <FormattedMessage {...messages.results} />
      </NavLink>
    </li>

    <li>
      <NavLink to='/leaderboard' onClick={props.closeMobileMenu}>
        <FormattedMessage {...messages.leaderboard} />
      </NavLink>
    </li>

    <li>
      <a
        href="https://github.com/osmlab/maproulette3/wiki"
        target="_blank"
        rel="noopener noreferrer"
        onClick={props.closeMobileMenu}>
        <FormattedMessage {...messages.help} />
      </a>
    </li>
  </React.Fragment>
)

const MobileNav = props => (
  <React.Fragment>
    <LoggedInUser {...props}>
      <Link to='/user/profile' onClick={props.closeMobileMenu}>
        <ProfileImage {...props} />
      </Link>

      <PointsTicker user={props.user} className="mr-my-4" />
    </LoggedInUser>

    <LoggedOutUser {...props}>
      <SignInButton className="white-on-green top-nav__signin-link"
                    {...props} />
    </LoggedOutUser>

    <ol className="mr-list-nav-mobile">
      <Nav {...props} />
    </ol>

    <LoggedInUser {...props}>
      <ol className="mr-list-nav-mobile mr-mt-6 mr-pt-6 mr-border-t mr-border-white-10">
        <li>
          <NavLink to='/admin/projects' onClick={props.closeMobileMenu}>
            <FormattedMessage {...messages.adminCreate} />
          </NavLink>
        </li>
        <li>
          <NavLink to='/user/profile' onClick={props.closeMobileMenu}>
            <FormattedMessage {...messages.profile} />
          </NavLink>
        </li>
        <li>
          <NavLink to="/inbox" onClick={props.closeMobileMenu}>
            <FormattedMessage {...messages.inbox} />
            <UnreadNotificationsIndicator {...props} inline />
          </NavLink>
        </li>
        <li>
          <NavLink to="/review" onClick={props.closeMobileMenu}>
            <FormattedMessage {...messages.review} />
          </NavLink>
        </li>
        <li>
          <NavLink to={{}} onClick={props.signout}>
            <FormattedMessage {...messages.signout} />
          </NavLink>
        </li>
      </ol>
    </LoggedInUser>
  </React.Fragment>
)

const LoggedInUser = props => {
  return _get(props, 'user.isLoggedIn') ? props.children : null
}

const LoggedOutUser = props => {
  return !_get(props, 'user.isLoggedIn') ? props.children : null
}
