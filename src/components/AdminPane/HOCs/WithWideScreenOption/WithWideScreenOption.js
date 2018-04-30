import React, { Component } from 'react'

/**
 * WithWideScreenOption passes down an isWideScreen prop to the wrapped component,
 * as well as a setWideScreen function for altering the isWideScreen prop.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default function WithWideScreenOption(WrappedComponent, defaultToWide=false) {
  return class extends Component {
    state = {
      isWideScreen: defaultToWide
    }

    setWideScreen = (isWide=true) => {
      this.setState({isWideScreen: isWide})
    }

    render() {
      return <WrappedComponent isWideScreen={this.state.isWideScreen}
                               setWideScreen={this.setWideScreen}
                               {...this.props} />
    }
  }
}
