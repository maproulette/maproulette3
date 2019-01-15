import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Sidebar.scss'

/**
 * Renders an unmanaged collapsible sidebar with the given children as content.
 * It can optionally display a close control if an onClose function is given,
 * or a minimize/maximize control if a toggleMinimized function is given.
 *
 * > Note that if both onClose and toggleMinimized are provided, onClose will
 * > take precedence and no minimize/maximize control will be shown.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class Sidebar extends Component {
  render() {
    const sidebarContent =
      this.props.isActive ?
      <div className='sidebar__content'>{this.props.children}</div> :
      null

    const closeIcon =
      this.props.onClose ?
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a className="delete sidebar__close" onClick={this.props.onClose}> </a> :
      null

    const minimizeIcon =
      this.props.toggleMinimized ?
      <div className="sidebar--minimizer">
        <button className="toggle-minimization" onClick={this.props.toggleMinimized} />
      </div> : null

    return (
      <div className={classNames('sidebar', {'is-active': this.props.isActive},
                                 this.props.className)}>
        {closeIcon || minimizeIcon}
        {sidebarContent}
      </div>
    )
  }
}

Sidebar.propTypes = {
  /** true if the sidebar is open, false if it is closed */
  isActive: PropTypes.bool,
  /**
   * if provided, a close control will be displayed that will invoke
   * this function when clicked.
   */
  onClose: PropTypes.func,
  /**
   * if provided, a minimize control will be displayed that will invoke
   * this function when clicked. Note that onClose takes priority if both
   * functions are given.
   */
  toggleMinimized: PropTypes.func,
}

Sidebar.defaultProps = {
  isActive: true,
}
