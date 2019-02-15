import React, { Component } from 'react'
import classNames from 'classnames'
import './Ribbon.scss'

export default class Ribbon extends Component {
  render() {
    return (
      <div className={classNames("ribbon ribbon-top-left", this.props.className)}>
        <span>{this.props.children}</span>
      </div>
    )
  }
}
