import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

const modalRoot = document.getElementById('external-root')

/**
 * Context that can be used to temporarily suspend clickouts for components
 * making use of External (which aren't otherwise detected as proper children
 * by react-clickout since they've been moved around in the DOM). Components
 * making use of react-clickout should check this context to see if any child
 * components wish to temporarily suspend clickouts
 */
export const ExternalContext = React.createContext({
  clickoutSuspended: false,
  suspendClickout(isSuspended) {
    this.clickoutSuspended = isSuspended
  }
})

export default class External extends Component {
  el = document.createElement('div')

  componentDidMount() {
    modalRoot?.appendChild(this.el)
  }

  componentWillUnmount() {
    modalRoot?.removeChild(this.el)
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el)
  }
}

External.propTypes = {
  children: PropTypes.node.isRequired,
}
