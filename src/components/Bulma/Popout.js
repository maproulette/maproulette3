import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _isUndefined from 'lodash/isUndefined'

/**
 * Popout displays a Bulma dropdown menu as a popout that appears
 * above, below, or to the right of the trigger element. The trigger
 * element should be given as the `control` prop while the menu options
 * should be given as children.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class Popout extends Component {
  render() {
    return (
      <div className={classNames(
        'popout', 'dropdown',
        {'popout-right': _isUndefined(this.props.direction) || this.props.direction === 'right',
         'is-up': this.props.direction === 'up',
         'is-active': this.props.isActive},
        this.props.className)}
      >
        <div className='dropdown-trigger popout-trigger' onClick={this.props.toggleActive}
             title={this.props.tooltip}>
          {this.props.control}
        </div>

        <div className='menu-wrapper'>
          <div className='dropdown-menu' role='menu'>
            <div className='dropdown-content popout-content'>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Popout.propTypes = {
  /** Determines if the popout is active/open or inactive/closed */
  isActive: PropTypes.bool.isRequired,
  /** Invoked to toggle the popout isActive state */
  toggleActive: PropTypes.func.isRequired,
  /** Trigger control (e.g. a button) */
  control: PropTypes.element.isRequired,
  /** Where the popout should appear relative to the trigger element */
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
}
