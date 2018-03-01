import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import WithErrors from '../../HOCs/WithErrors/WithErrors'
import AppErrors from '../../../services/Error/AppErrors'
import './MapPane.css'

/**
 * MapPane is a thin wrapper around map components that primarily serves as a
 * convenient boundary for CSS styling.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class MapPane extends Component {
  state = {hasError: false}

  componentDidCatch(error, info) {
    this.setState({hasError: true})
    this.props.addError(AppErrors.map.renderFailure)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="map-pane container is-fluid">
          <div className="notification">
            <FormattedMessage {...AppErrors.map.renderFailure} />
          </div>
        </div>
      )
    }

    return (
      <div className="map-pane">
        {this.props.children || this.props.map}
      </div>
    )
  }
}

export default WithErrors(MapPane)
