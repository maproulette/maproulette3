import React, { Component } from 'react'
import PropTypes from 'prop-types'
import WithChallengeManagement
       from '../../HOCs/WithChallengeManagement/WithChallengeManagement'


/**
 * VisibilitySwitch renders a simple switch, with optional label, that
 * toggles the given challenge's enabled status true or false as the
 * switch is activated or deactivated, respectively.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class VisibilitySwitch extends Component {
  toggleVisible = () => {
    this.props.updateEnabled(this.props.challenge.id,
                             !this.props.challenge.enabled)
  }

  render() {
    if (!this.props.challenge) {
      return null
    }

    return (
      <div className="visibility-switch mr-mb-2" onClick={this.toggleVisible}>
        <input type="checkbox" className="switch is-rounded short-and-wide"
               disabled={this.props.disabled}
               checked={this.props.challenge.enabled}
               onChange={() => null} />
        <label>{this.props.label}</label>
      </div>
    )
  }
}

VisibilitySwitch.propTypes = {
  challenge: PropTypes.object,
  updateEnabled: PropTypes.func.isRequired,
  label: PropTypes.node,
}

export default WithChallengeManagement(VisibilitySwitch)
