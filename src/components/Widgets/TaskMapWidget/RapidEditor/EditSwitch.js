import React, { Component } from 'react'

/**
 * EditSwitch renders a simple switch, with optional label, that
 * toggles and shows the map status as the switch is
 * activated or deactivated .
 *
 * @author [Matthew Espinoza](https://github.com/mattespoz)
 */

export class EditSwitch extends Component {
  toggleVisible = () => {
    this.props.updateUserAppSetting(this.props.user.id, {
      isEditMode: !this.props.getUserAppSetting(this.props.user, 'isEditMode'),
    });
  }

  render() {
    const editModeOn = this.props.getUserAppSetting(this.props.user, 'isEditMode')

    return (
      <div className="mr-flex mr-justify-center">
        <label className="switch-container">
          <input type="checkbox" checked={editModeOn} />
          <span className="slider round" onClick={() => this.toggleVisible()}></span>
        </label>
        <span className="mr-ml-2">
          {editModeOn ? 'Edit Mode' : 'Classic Mode'}
        </span>
      </div>
    )
  }
}

export default EditSwitch
