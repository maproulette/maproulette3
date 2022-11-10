import React, { Component } from 'react'
const WithMetricsLoaded = function (WrappedComponent){
  return class extends Component {
    state = {loaded: false}
    setLoaded = () => this.setState({loaded: true})
    render() {
        return <WrappedComponent
        {...this.props}
        loaded={this.state.loaded}
        setLoaded={this.setLoaded}>
    </WrappedComponent>
    }
  }
}
export default WrappedComponent => WithMetricsLoaded(WrappedComponent)