import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import WithOptionalManagement
       from '../HOCs/WithOptionalManagement/WithOptionalManagement'
import ConfirmAction from '../ConfirmAction/ConfirmAction'
import SimpleDropdown from './SimpleDropdown'

/**
 * DropdownButton is an optionally self-managed component that sets up a Bulma
 * dropdown menu that is intended to be activated by a button passed a child
 * component, though it can also be determined by the `isActive` prop. Menu
 * options to be displayed should be passed as an `options` prop array, each
 * with at least `key` and `text` fields. The `onSelect` prop function is
 * invoked when a menu option is selected.
 *
 * If no isActive prop is given, it will self-manage its own state. Otherwise,
 * a toggleActive prop must also be provided in addition to isActive.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class DropdownButton extends Component {
  selectOption = (e, option) => {
    e.preventDefault()
    this.props.onSelect && this.props.onSelect(option, this.props.context)
    this.props.toggleActive()
  }

  render() {
    const options = this.props.options.map(option => {
      const link = (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a key={option.key}
          className={classNames('dropdown-item', option.className)}
          onClick={(e) => this.selectOption(e, option)}>
          {option.text}
        </a>
      )

      return option.confirm ?
             <ConfirmAction key={option.key}>{link}</ConfirmAction> :
             link
    })

    return (
      <SimpleDropdown {...this.props}
                      label={this.props.children}
                      isActive={this.props.isActive()}
                      toggleActive={this.props.toggleActive}>
        {options.length > 0 ? options : this.props.emptyContent}
      </SimpleDropdown>
    )
  }
}

DropdownButton.propTypes = {
  /** Determines whether the dropdown is active/open or inactive/closed */
  isActive: PropTypes.func,
  /** Array of menu options, each with at least key and text fields */
  options: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.node.isRequired,
    text: PropTypes.node.isRequired,
    className: PropTypes.string,
    confirm: PropTypes.bool,
  })),
  /** Optional content to display if dropdown is empty (no options) */
  emptyContent: PropTypes.element,
  /** Invoked when a menu option is selected by the user */
  onSelect: PropTypes.func,
  /** Invoked to toggle the current active/inactive state of the dropdown */
  toggleActive: PropTypes.func,
  /** Invoked to deactivate/close the menu */
  deactivate: PropTypes.func,
}

export default WithOptionalManagement(DropdownButton)
