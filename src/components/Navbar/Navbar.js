import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import MediaQuery from 'react-responsive'
import MobileMenu from 'react-burger-menu/lib/menus/slide'
import _startsWith from 'lodash/startsWith'
import _get from 'lodash/get'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import AccountNavItem from './AccountNavItem/AccountNavItem'
import SignInButton from '../SignInButton/SignInButton'
import messages from './Messages'
import './Navbar.css'

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

  signout = () => {
    this.props.logoutUser()
    this.closeMobileMenu()
  }

  render() {
    return (
      <nav className="navbar top-nav" aria-label="main navigation">
				<div className="navbar-brand">
          <Link to='/' className="navbar-item top-nav__home-link">
            <SvgSymbol viewBox='0 0 20 20' sym="mr-logo" className="navbar__logo"/>
            <span className="is-size-4">
              <span className="has-text-weight-bold">Map</span>Roulette
            </span>
          </Link>
				</div>

        <MediaQuery query="(min-width: 1024px)">
          <div className='navbar-menu'>
            <div className="navbar-start">
              <NavbarPrimaryLinks {...this.props} />
            </div>

            <div className="navbar-end">
              <AccountNavItem {...this.props} />
            </div>
          </div>
        </MediaQuery>

        <MediaQuery query="(max-width: 1023px)">
          <MobileMenu right
                      customBurgerIcon={<SvgSymbol viewBox='0 0 20 20' sym="menu-icon" />}
                      customCrossIcon={<SvgSymbol viewBox='0 0 20 20' sym="cross-icon" />}
                      isOpen={this.state.mobileMenuOpen}
                      onStateChange={this.setMobileMenuState}
                      styles={{bmOverlay: {background: 'rgb(0,165,146, 0.7)'},
                               bmMenuWrap: {width: '275px'},
                               bmCrossButton: {top: '20px', right: '16px'}}}
          >
            {_get(this.props, 'user.isLoggedIn') ?
              <Link to='/user/profile' onClick={this.closeMobileMenu}>
                <figure className="navbar__account-nav-item__avatar image is-96x96">
                  <div className="circular-image"
                        style={{backgroundImage: `url(${this.props.user.osmProfile.avatarURL})`}} />
                </figure>
              </Link>
            :
             <SignInButton className="white-on-green top-nav__signin-link"
                           {...this.props} />
            }

            <NavbarPrimaryLinks onLinkClick={this.closeMobileMenu}
                                {...this.props } />

            {_get(this.props, 'user.isLoggedIn') &&
             <React.Fragment>
               <Link to='/user/profile' className="navbar-item top-nav__profile-link"
                     onClick={this.closeMobileMenu}>
                 <span className={classNames('item-text',
                       {'is-active': this.props.location.pathname === '/user/profile'})}>
                   <FormattedMessage {...messages.profile} />
                 </span>
               </Link>

               <a className="navbar-item top-nav__signout-link" onClick={this.signout}>
                 <span className="item-text">
                   <FormattedMessage {...messages.signout} />
                 </span>
               </a>
             </React.Fragment>
            }

          </MobileMenu>
        </MediaQuery>
			</nav>
    )
  }
}

const NavbarPrimaryLinks = function(props) {
  return (
    <React.Fragment>
      <Link to='/about' className="navbar-item top-nav__about-link"
            onClick={props.onLinkClick}>
        <span className={classNames('item-text',
                                    {'is-active': props.location.pathname === '/about'})}>
          <FormattedMessage {...messages.about} />
        </span>
      </Link>

      <Link to='/browse/challenges' className="navbar-item top-nav__browse-link"
            onClick={props.onLinkClick}>
        <span className={
          classNames('item-text',
                      {'is-active': /\/browse\/challenges/.test(props.location.pathname)})}>
          <FormattedMessage {...messages.results} />
        </span>
      </Link>

      {process.env.REACT_APP_FEATURE_LEADERBOARD === 'enabled' &&
        <Link to='/leaderboard' className="navbar-item top-nav__browse-link"
              onClick={props.onLinkClick}>
          <span className={
            classNames('item-text',
                      {'is-active': /\/leaderboard/.test(props.location.pathname)})}>
            <FormattedMessage {...messages.leaderboard} />
          </span>
        </Link>
      }

      {_get(props, 'user.isLoggedIn') &&
      <Link to='/admin/projects' className='navbar-item top-nav__admin-link'
            onClick={props.onLinkClick}>
          <span className={
            classNames('item-text',
                      {'is-active': _startsWith(props.location.pathname, '/admin')})
          }>
            <FormattedMessage {...messages.adminCreate} />
          </span>
        </Link>
      }
    </React.Fragment>
  )
}

Navbar.propTypes = {
  /** router location object */
  location: PropTypes.object.isRequired,
}
