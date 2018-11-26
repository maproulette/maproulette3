import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class Header extends Component {
  render() {
    return (
      <header
        className={classNames(
          'md:mr-flex md:mr-items-center md:mr-justify-between',
          this.props.className
        )}
      >
        <div className="mr-mb-4 md:mr-mb-0">
          {this.props.eyebrow}
          {this.props.title}
          {this.props.info}
        </div>
        <div className="md:mr-ml-4 md:mr-text-right">{this.props.actions}</div>
      </header>
    )
  }
}

Header.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node.isRequired,
  info: PropTypes.node,
  actions: PropTypes.node,
}

export default Header
