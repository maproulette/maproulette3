import React, { Component } from 'react'
import PropTypes from 'prop-types'

/**
 * Re-renders the child component on a timer that defaults to re-rendering
 * every 1/2 second, but can be controlled with the renderInterval prop. Note
 * that the child component is cloned on each render
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class IntervalRender extends Component {
  timerHandle = null

  state = {
    counter: 0,
  }

  bumpCounter = () => {
    this.setState({counter: this.state.counter + 1})
  }

  clearTimer = () => {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle)
      this.timerHandle = null
    }
  }

  componentDidMount() {
    this.clearTimer()
    this.timerHandle = setInterval(this.bumpCounter, this.props.renderInterval)
  }

  componentWillUnmount() {
    this.clearTimer()
  }

  render() {
    return React.cloneElement(this.props.children)
  }
}

IntervalRender.propTypes = {
  /** milliseconds between renderings */
  renderInterval: PropTypes.number,
}

IntervalRender.defaultProps = {
  renderInterval: 500, // 1/2 second
}
