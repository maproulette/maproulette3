import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MenuList from './MenuList'
import './Menu.scss'

/**
 * Menu renders a Bulma menu with the given menuLists
 */
export default class Menu extends Component {
  render() {
    const menuLists = this.props.menuLists ?
                      this.props.menuLists.map(menuConfig =>
                        <MenuList key={menuConfig.key || menuConfig.label}
                                  label={menuConfig.label}
                                  options={menuConfig.options}
                                  {...this.props} />
                      ) : this.props.children

    return (
      <aside className="menu">{menuLists}</aside>
    )
  }
}

Menu.propTypes = {
  menuLists: PropTypes.arrayOf(PropTypes.object),
}
