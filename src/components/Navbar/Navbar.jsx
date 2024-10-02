import { Fragment, Component } from 'react'
import MediaQuery from 'react-responsive'
import MobileMenu from 'react-burger-menu/lib/menus/slide'
import classNames from 'classnames'
import _get from 'lodash/get'
import _last from 'lodash/last'
import { Link, NavLink } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import AsManager from "../../interactions/User/AsManager"
import AsAvatarUser from '../../interactions/User/AsAvatarUser'
import SignInButton from '../SignInButton/SignInButton'
import PointsTicker from '../PointsTicker/PointsTicker'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import Dropdown from '../Dropdown/Dropdown'
import AchievementBadge from '../AchievementBadge/AchievementBadge'
import messages from './Messages'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'
import './Navbar.scss'

const screens = resolveConfig(tailwindConfig).theme.screens

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

  showHomePage = () => {
    // Record in session storage that the user really does want to see the home
    // page so that we don't redirect them to the Dashboard (if they're signed
    // in) like we usually would
    try {
      sessionStorage.setItem('goHome', 'true')
    } catch (e) {
      console.log(e)
    }
  }

  signout = () => {
    this.props.logoutUser(_get(this.props, 'user.id'))
    this.closeMobileMenu()
  }

  render() {
    const isSuperUser = AsManager(this.props.user).isSuperUser()
    return (
      <header className="mr-relative mr-bg-gradient-r-green-blue mr-shadow mr-p-6 mr-flex mr-items-center mr-justify-between">
        <nav className="mr-flex mr-items-center">
          <Link
            to='/'
            rel="home"
            className="mr-text-white hover:mr-text-current"
            onClick={this.showHomePage}
          >
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
              {_get(this.props, 'user.achievements.length', 0) > 0 &&
               <Link className="mr-mx-4 mr-w-16" to="/user/achievements">
                 <div className="mr-relative mr-w-12">
                   <AchievementBadge
                     size="small"
                     achievement={_last(this.props.user.achievements)}
                     stackDepth={Math.min(3, this.props.user.achievements.length - 1)}
                   />
                 </div>
               </Link>
              }
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
              isSuperUser={isSuperUser}
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
    <div
      className={classNames(
        "mr-rounded-full mr-bg-red-light mr-flex mr-justify-center mr-items-center",
        {
          "mr-absolute mr-top-0 mr-left-45/100 mr-translate-x-1/2 mr-w-5 mr-h-5": !props.inline,
          "mr-inline-block mr-ml-2 mr-w-5 mr-h-5": props.inline,
        }
      )}
    >
      <div className="mr-text-white mr-text-xxs">
        {props.user.unreadNotificationCount}
      </div>
    </div>
  )
}

export const ProfileMenu = function(props) {
  const isSuperUser = AsManager(props.user).isSuperUser();

  return (
    <ol className="mr-list-dropdown">
      <li>
        <NavLink to="/inbox" onClick={props.closeDropdown}>
          <div className="mr-flex">
            <FormattedMessage {...messages.inbox} />
            <UnreadNotificationsIndicator {...props} inline />
          </div>
        </NavLink>
      </li>
      <li>
        <NavLink to="/sent" onClick={props.closeDropdown}>
          <FormattedMessage {...messages.sent} />
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
      {
        isSuperUser && import.meta.env.VITE_DISABLE_SUPER_ADMIN_METRICS !== 'true'
          ? <li>
              <NavLink to="/superadmin" onClick={props.closeDropdown}>
                <FormattedMessage {...messages.superAdmin} />
              </NavLink>
            </li>
          : null
      }
      <li>
        <NavLink to="/user/achievements" onClick={props.closeDropdown}>
          <FormattedMessage {...messages.achievements} />
        </NavLink>
      </li>
      <li>
        <NavLink to="/teams" onClick={props.closeDropdown}>
          <FormattedMessage {...messages.teams} />
        </NavLink>
      </li>
      <li>
        <NavLink to="/activity" onClick={props.closeDropdown}>
          <FormattedMessage {...messages.globalActivity} />
        </NavLink>
      </li>
      <li>
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
    src={AsAvatarUser(props.user.osmProfile).profilePic(256)}
    alt=''
  />
)

const Nav = props => (
  <Fragment>
    <LoggedInUser {...props}>
      <li className="mr-flex mr-flex-col mr-justify-center">
        <NavLink to="/dashboard" onClick={props.closeMobileMenu}>
          <FormattedMessage {...messages.dashboard} />
        </NavLink>
      </li>
    </LoggedInUser>

    <li className="mr-flex mr-flex-col mr-justify-center">
      <NavLink to='/browse/challenges' onClick={props.closeMobileMenu}>
        <FormattedMessage {...messages.results} />
      </NavLink>
    </li>

    <li className="mr-flex mr-flex-col mr-justify-center">
      <NavLink to='/leaderboard' onClick={props.closeMobileMenu}>
        <FormattedMessage {...messages.leaderboard} />
      </NavLink>
    </li>

    <li className="mr-flex mr-flex-col mr-justify-center">
      <a
        href={import.meta.env.VITE_DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={props.closeMobileMenu}>
        <FormattedMessage {...messages.help} />
      </a>
    </li>

    <li className="mr-flex mr-flex-col mr-justify-center">
      <a
        href="https://blog.maproulette.org/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={props.closeMobileMenu}>
        <FormattedMessage {...messages.blog} />
      </a>
    </li>

    <li className="mr-flex mr-flex-col mr-justify-center">
      <a
        href="https://openstreetmap.app.neoncrm.com/forms/maproulette"
        target="_blank"
        rel="noopener noreferrer"
        onClick={props.closeMobileMenu}>
        <FormattedMessage {...messages.donate} />
      </a>
    </li>
  </Fragment>
)

const MobileNav = props => (
  <Fragment>
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
          <NavLink to="/user/metrics" onClick={props.closeMobileMenu}>
            <FormattedMessage {...messages.metrics} />
          </NavLink>
        </li>
        {props.isSuperUser ? (
          <li>
            <NavLink to='/superadmin' onClick={props.closeMobileMenu}>
              <FormattedMessage {...messages.superAdmin} />
            </NavLink>
          </li>
        ) : null}
        <li>
          <NavLink to="/user/achievements" onClick={props.closeMobileMenu}>
            <FormattedMessage {...messages.achievements} />
          </NavLink>
        </li>
        <li>
          <NavLink to="/teams" onClick={props.closeMobileMenu}>
            <FormattedMessage {...messages.teams} />
          </NavLink>
        </li>
        <li>
          <NavLink to="/inbox" onClick={props.closeMobileMenu}>
            <div className="mr-flex">
              <FormattedMessage {...messages.inbox} />
              <UnreadNotificationsIndicator {...props} inline />
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink to="/sent" onClick={props.closeMobileMenu}>
            <FormattedMessage {...messages.sent} />
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
  </Fragment>
)

const LoggedInUser = props => {
  return _get(props, 'user.isLoggedIn') ? props.children : null
}

const LoggedOutUser = props => {
  return !_get(props, 'user.isLoggedIn') ? props.children : null
}
