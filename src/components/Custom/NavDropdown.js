import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import WithDeactivateOnOutsideClick from
       '../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import _isUndefined from 'lodash/isUndefined'
import _isObject from 'lodash/isObject'
import _find from 'lodash/find'

/**
 * NavDropdown presents a Bulma nav-dropdown with additional logic for
 * determining the active test based on the value of the dropdown or a given
 * placeholder if no value is active. It also wraps itself in a
 * WithDeactivateOnOutsideClick so that the dropdown will be automatically
 * closed if the user clicks off the dropdown.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class NavDropdown extends Component {
  selectOption = (e, option) => {
    e.preventDefault()
    this.props.onChange && this.props.onChange(option)
    this.props.deactivate()
  }

  /**
   * Determine the active dropdown label displayed based on the current
   * value, using the placeholder if no value is set, or a default string
   * if no placeholder is given either.
   *
   * @private
   */
  dropdownLabel = () => {
    let label = <span className='default-label'>Choose</span>
    if (!_isUndefined(this.props.value)) {
      if (_isObject(this.props.value)) {
        label = <span className='current-value'>{this.props.value.text}</span>
      }
      else {
        const matchingOption = _find(this.props.options, {value: this.props.value})
        if (matchingOption) {
          label = <span className='current-value'>{matchingOption.text}</span>
        }
      }
    }
    else if (this.props.placeholder) {
      label = <span className='placeholder'>{this.props.placeholder}</span>
    }

    return label
  }

  render() {
    const dropdownItems = this.props.options.map(option => {
      if (option.Renderable) {
        return <option.Renderable key={option.key} {...this.props} {...option.ownProps} />
      }

      return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a key={option.key} className='navbar-item'
           onClick={(e) => this.selectOption(e, option)}>
          {option.text}
        </a>
      )
    })

    return (
      <div className={classNames('nav-dropdown', 'navbar-item', 'has-dropdown',
                                 {'is-active': this.props.isActive},
                                 this.props.className)}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className='navbar-link' onClick={this.props.toggleActive}>
          {this.props.label && <label>{this.props.label}</label>}
          {this.dropdownLabel()}
        </a>

        <div className='navbar-dropdown'>
          {dropdownItems}
        </div>
      </div>
    )
  }
}

NavDropdown.propTypes = {
  /** Label displayed above the dropdown */
  label: PropTypes.node,
  /** Invoked when the value is changed */
  onChange: PropTypes.func,
  /** Optional placeholder to be displayed when there is no value */
  placeholder: PropTypes.string,
  /** Array of dropdown options, each with at least key and text fields */
  options: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.node,
    text: PropTypes.node,
  })),
}

export default WithDeactivateOnOutsideClick(NavDropdown)
