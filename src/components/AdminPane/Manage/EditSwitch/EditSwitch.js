import React, { Component } from 'react'
  
/**
 * EditSwitch renders a simple switch, with optional label, that
 * toggles and shows the map status as the switch is
 * activated or deactivated .
 *
 * @author [Matthew Espinoza](https://github.com/mattespoz)
 */
export class EditSwitch extends Component {
  state = {
    checked: false
  }

  toggleVisible = () => {
    const checked = !this.state.checked
    this.setState({ checked })
    this.props.updateEnabled(this.props.challenge.id, checked)
  }

  render() {
    return (
      <div className="mr-flex mr-justify-center">
        <label className="switch-container">
          <input type="checkbox" checked={this.state.checked} onChange={() => null}/>
          <span className="slider round" onClick={this.toggleVisible}></span>
        </label>
        <span className="mr-ml-2">
          {this.state.checked ? 'Edit Mode' : 'Classic Mode'}
        </span>
      </div>
    )
  }
}

export default EditSwitch
