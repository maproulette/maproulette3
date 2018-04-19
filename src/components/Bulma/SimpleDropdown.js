import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _isUndefined from 'lodash/isUndefined'
import _isArray from 'lodash/isArray'
import './SimpleDropdown.css'

/**
 * SimpleDropdown is an optionally self-managed component that sets up a Bulma
 * dropdown containing the given children as content. If no isActive prop is
 * given, it will manage its own active state.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class SimpleDropdown extends Component {
  state = {
    isActive: false
  }

  isSelfManaged = () => _isUndefined(this.props.isActive)

  isActive = () =>
    this.isSelfManaged() ? this.state.isActive : this.props.isActive

  toggleActive = () => {
    if (this.isSelfManaged()) {
      this.setState({isActive: !this.state.isActive})
    }
    else {
      this.props.toggleActive()
    }
  }

  render() {
    return (
      <div className={classNames('SimpleDropdown dropdown',
                                 {'is-active': this.isActive(), 'is-right': this.props.isRight},
                                 this.props.className)}>
        <div className={classNames('dropdown-trigger', this.props.triggerClassName)}
             title={this.props.tooltip}
             onClick={this.toggleActive}>
          {this.props.label}
        </div>

        <div className="menu-wrapper">
          <div className="dropdown-menu" role='menu'>
            <div className="dropdown-content">
              {_isArray(this.props.children) ?
              this.props.children :
              <div className="dropdown-item">{this.props.children}</div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SimpleDropdown.propTypes = {
  /** Label for the dropdown trigger */
  label: PropTypes.node.isRequired,
  /** Optional tooltip to display on hover of the trigger button */
  tooltip: PropTypes.string,
  /** Set to true to right-align dropdown */
  isRight: PropTypes.bool,
  /** Optional: whether the dropdown is active/open or inactive/closed */
  isActive: PropTypes.bool,
  /**
   * Invoked to toggle the current active/inactive state of the dropdown. Must
   * be provided if isActive is provided (and will be ignored if isActive is
   * not provided).
   */
  toggleActive: PropTypes.func,
}
