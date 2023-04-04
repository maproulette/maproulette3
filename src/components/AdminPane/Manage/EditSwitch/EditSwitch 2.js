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
    isEditMode: this.props.getUserAppSetting(this.props.user, 'isEditMode') || false,
  }

  toggleVisible = () => {
    const newIsEditMode = !this.state.isEditMode;
      this.setState({
        isEditMode: newIsEditMode,
      });
      this.props.updateUserAppSetting(this.props.user.id, {
        isEditMode: newIsEditMode,
      });
  }

  render() {
    return (
      <div className="mr-flex mr-justify-center">
        <label className="switch-container">
          <input type="checkbox" checked={this.state.isEditMode} onChange={() => null}/>
          <span className="slider round" onClick={this.toggleVisible}></span>
        </label>
        <span className="mr-ml-2">
          {this.state.isEditMode ? 'Edit Mode' : 'Classic Mode'}
        </span>
      </div>
    )
  }
}

export default EditSwitch
