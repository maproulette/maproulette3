import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

/**
 * DropdownButton sets up a Bulma dropdown menu that is intended to
 * be activated by a button passed a child component, though in reality
 * it's determined by the `isActive` prop. Menu
 * options to be displayed should be passed as an `options` prop array, each with
 * at least `key` and `text` fields. The `onSelect` prop function is invoked when
 * a menu option is selected, and the `deactivate` function prop is invoked when
 * interaction with the dropdown indicates it should be closed/deactivated (notably
 * when an option is selected).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class DropdownButton extends Component {
  selectOption = (e, option) => {
    e.preventDefault()
    this.props.onSelect && this.props.onSelect(option)
    this.props.deactivate()
  }

  render() {
    const options = this.props.options.map(option => (
      <a key={option.key} className='dropdown-item' onClick={(e) => this.selectOption(e, option)}>
        {option.text}
      </a>
    ))

    return (
      <div className={classNames('DropdownButton', 'dropdown', {'is-active': this.props.isActive},
                                 this.props.className)}>
        <div className={classNames('dropdown-trigger', this.props.triggerClassName)}
             onClick={this.props.toggleActive}>
          {this.props.children}
        </div>

        <div className='menu-wrapper'>
          <div className='dropdown-menu' role='menu'>
            <div className='dropdown-content'>
              {options}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

DropdownButton.propTypes = {
  /** Determines whether the dropdown is active/open or inactive/closed */
  isActive: PropTypes.bool.isRequired,
  /** Array of menu options, each with at least key and text fields */
  options: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.node.isRequired,
    text: PropTypes.node.isRequired,
  })),
  /** Invoked when a menu option is selected by the user */
  onSelect: PropTypes.func,
  /** Invoked to toggle the current active/inactive state of the dropdown */
  toggleActive: PropTypes.func.isRequired,
  /** Invoked to deactivate/close the menu */
  deactivate: PropTypes.func.isRequired,
}
