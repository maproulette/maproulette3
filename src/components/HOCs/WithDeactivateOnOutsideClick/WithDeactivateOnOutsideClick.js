import React, { Component } from 'react'
import onClickOutside from 'react-onclickoutside'
import _omit from 'lodash/omit'

export default function(WrappedComponent) {
  class WithDeactivateOnOutsideClick extends Component {
    state = {isActive: false}

    activate = () => {
      this.setState({isActive: true})
      this.props.enableOnClickOutside()
    }

    deactivate = () => {
      this.setState({isActive: false})
      this.props.disableOnClickOutside()
    }

    toggleActive = () => this.state.isActive ? this.deactivate() : this.activate()

    handleClickOutside = (e) => {
      if (this.state.isActive) {
        this.deactivate()
      }
    }

    render() {
      return (
        <WrappedComponent isActive={this.state.isActive}
                          toggleActive={this.toggleActive}
                          activate={this.activate}
                          deactivate={this.deactivate}
                          {..._omit(this.props, [
                            'isActive',
                            'toggleActive',
                            'activate',
                            'deactivate'
                          ])} />
      )
    }
  }

  return onClickOutside(WithDeactivateOnOutsideClick)
}
