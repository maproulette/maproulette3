import React, { Component } from 'react'
import './MapPane.css'

/**
 * MapPane is a thin wrapper around map components that primarily serves as a
 * convenient boundary for CSS styling.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class MapPane extends Component {
  render() {
    return (
      <div className="map-pane">
        {this.props.children || this.props.map}
      </div>
    )
  }
}
