import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _startsWith from 'lodash/startsWith'
import _get from 'lodash/get'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import AccountNavItem from './AccountNavItem/AccountNavItem'
import messages from './Messages'
import './Navbar.css'

/**
 * Navbar renders the primary top nav in the application, including the brand,
 * primary nav links, and user-account menu controls.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class Navbar extends Component {
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

				<div className='navbar-menu'>
          <div className="navbar-start">
            <Link to='/about' className="navbar-item top-nav__about-link">
              <span className={classNames('item-text',
                                          {'is-active': this.props.location.pathname === '/about'})}>
                <FormattedMessage {...messages.about} />
              </span>
            </Link>

            <Link to='/browse/challenges' className="navbar-item top-nav__browse-link">
              <span className={
                classNames('item-text',
                           {'is-active': /\/browse\/challenges/.test(this.props.location.pathname)})}>
                <FormattedMessage {...messages.results} />
              </span>
            </Link>

            {process.env.REACT_APP_FEATURE_LEADERBOARD === 'enabled' &&
             <Link to='/leaderboard' className="navbar-item top-nav__browse-link">
               <span className={
                 classNames('item-text',
                            {'is-active': /\/leaderboard/.test(this.props.location.pathname)})}>
                 <FormattedMessage {...messages.leaderboard} />
               </span>
             </Link>
            }

            {_get(this.props, 'user.isLoggedIn') &&
            <Link to='/admin/projects' className='navbar-item top-nav__admin-link'>
               <span className={
                 classNames('item-text',
                           {'is-active': _startsWith(this.props.location.pathname, '/admin')})
               }>
                 <FormattedMessage {...messages.adminCreate} />
               </span>
             </Link>
            }
          </div>

          <div className="navbar-end">
            <a className="navbar-item back-to-old-ui" href="/">
              <FormattedMessage {...messages.oldLayout} />
            </a>

            <AccountNavItem {...this.props} />
          </div>
				</div>
			</nav>
    )
  }
}

Navbar.propTypes = {
  /** router location object */
  location: PropTypes.object.isRequired,
}
