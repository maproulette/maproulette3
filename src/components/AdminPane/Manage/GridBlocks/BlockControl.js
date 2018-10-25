import React, { Component } from 'react'

export default class BlockControl extends Component {
  render() {
    return(
      <div className="grid-block__header__title-row__controls__control">
        {this.props.children}
      </div>
    )
  }
}
