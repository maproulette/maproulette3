import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import WithErrors from '../../HOCs/WithErrors/WithErrors'
import AppErrors from '../../../services/Error/AppErrors'
import './MapPane.scss'

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
    this.props.addErrorWithDetails(AppErrors.map.renderFailure, error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="map-pane">
          <div className="notification">
            <FormattedMessage {...AppErrors.map.renderFailure} values={{details: ''}} />
          </div>
        </div>
      )
    }

    const childrenWithProps = React.Children.map(
      this.props.children,
      child => React.cloneElement(child, {...this.props})
    )

    return <div className="map-pane">{childrenWithProps}</div>
  }
}

export default WithErrors(MapPane)
