import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _isObject from 'lodash/isObject'
import _find from 'lodash/find'
import _get from 'lodash/get'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

/**
 * MenuList renders a Bulma menu-list with an interface compatible with
 * NavDropdown so that components can render into a standalone drop-down or a
 * menu list depending on the situation.
 */
export default class MenuList extends Component {
  selectOption = (e, option) => {
    e.preventDefault()
    this.props.onChange && this.props.onChange(option)
  }

  activeOption = () => {
    return _isObject(this.props.value) ?
            this.props.value :
            _find(this.props.options, {value: this.props.value})
  }

  render() {
    const menuItems = this.props.options.map(option => {
      const menuOption =
        option.Renderable ?
        <option.Renderable {...this.props} {...option.ownProps} /> :
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a onClick={(e) => this.selectOption(e, option)}>{option.text}</a>

      return (
        <li key={option.key}>
          {option.value === _get(this.activeOption(), 'value') &&
           <SvgSymbol viewBox='0 0 20 20' sym="circle-icon"
                      className="menu-list__active-indicator" />
          }
          {menuOption}
        </li>
      )
    })

    const menuList = <ul className="menu-list">{menuItems}</ul>
    return !this.props.label ? menuList : (
      <React.Fragment>
        <p className="menu-label">{this.props.label}</p>
        {menuList}
      </React.Fragment>
    )
  }
}

MenuList.propTypes = {
  /** Heading for the menu */
  label: PropTypes.node,
  /** Array of menu options, each with at least key and text fields */
  options: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.node,
    text: PropTypes.node,
  })),
}
