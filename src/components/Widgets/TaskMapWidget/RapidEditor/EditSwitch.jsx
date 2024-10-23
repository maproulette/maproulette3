import { Component } from 'react'

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
    const editModeOn = this.props.editMode
    const disableRapid = this.props.disableRapid

    return (
      <div className="mr-flex mr-justify-center">
        {!disableRapid && (
          <label htmlFor="edit-mode-checkbox" className="switch-container mr-mr-2">
            <input 
              type="checkbox" 
              id="edit-mode-checkbox"
              checked={editModeOn} 
              onChange={this.toggleVisible} 
            />
            <span className="slider round"></span>
          </label>
        )}
        <span>{editModeOn ? 'Edit Mode' : 'Classic Mode'}</span>
      </div>
    )
  }
}

export default EditSwitch
