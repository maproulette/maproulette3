import { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

const modalRoot = document.getElementById('external-root')

class External extends Component {
  el = document.createElement('div')

  componentDidMount() {
    modalRoot.appendChild(this.el)
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el)
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el)
  }
}

External.propTypes = {
  children: PropTypes.node.isRequired,
}

export default External
