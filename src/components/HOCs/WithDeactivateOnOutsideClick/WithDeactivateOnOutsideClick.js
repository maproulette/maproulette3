import React, { Component } from 'react'
import onClickOutside from 'react-onclickoutside'
import _omit from 'lodash/omit'

export default function(WrappedComponent, initiallyActive=false) {
  class WithDeactivateOnOutsideClick extends Component {
    state = {isActive: initiallyActive}

    activate = () => {
      this.setState({isActive: true})
      this.props.enableOnClickOutside()

      if (this.props.onActivate) {
        this.props.onActivate()
      }
    }

    deactivate = () => {
      this.setState({isActive: false})
      this.props.disableOnClickOutside()

      if (this.props.onDeactivate) {
        this.props.onDeactivate()
      }
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
