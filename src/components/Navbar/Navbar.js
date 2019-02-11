import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { screens } from '../../tailwind'
import MobileMenu from 'react-burger-menu/lib/menus/slide'
import _get from 'lodash/get'
import { Link, NavLink } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import SignInButton from '../SignInButton/SignInButton'
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
    dropdownMenuOpen: false,
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

  toggleDropdownMenu = () => {
    this.setState({dropdownMenuOpen: !this.state.dropdownMenuOpen})
  }

  closeDropdownMenu = () => {
    this.setState({dropdownMenuOpen: false})
  }

  signout = () => {
    this.props.logoutUser()
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
              <Dropdown
                className="mr-dropdown--right"
                button={<ProfileButton {...this.props} />}
                isVisible={this.state.dropdownMenuOpen}
                toggleVisible={this.toggleDropdownMenu}
                close={this.closeDropdownMenu}
              >
                <ol className="mr-list-dropdown">
                  <li>
                    <NavLink to='/admin/projects' onClick={this.closeDropdownMenu}>
                      <FormattedMessage {...messages.adminCreate} />
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/user/profile" onClick={this.closeDropdownMenu}>
                      <FormattedMessage {...messages.profile} />
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={{}} onClick={this.props.logoutUser}>
                      <FormattedMessage {...messages.signout} />
                    </NavLink>
                  </li>
                </ol>
              </Dropdown>
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
    <span className="mr-flex mr-items-center mr-text-white">
      <div className="mr-relative">
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
        href="https://github.com/osmlab/maproulette3/wiki/Help-and-Resources"
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
