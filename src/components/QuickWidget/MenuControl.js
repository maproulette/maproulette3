import React, { Component } from 'react'

/**
 * Wraps a grid block control with the appropriate CSS classes to ensure it
 * displays properly in the block's dropdown menu
 */
export default class MenuControl extends Component {
  render() {
    return(
      <div className="widget__menu-controls__control">
        {this.props.children}
      </div>
    )
  }
}
