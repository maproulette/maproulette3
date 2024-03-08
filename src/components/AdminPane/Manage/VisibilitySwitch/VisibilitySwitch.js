import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'
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
    if (_isEmpty(this.props.challenge)) {
      return null
    }

    return (
      <div className="mr-flex mr-justify-center">
        <label htmlFor="switch-label" className="switch-container">
          <input 
            type="checkbox" 
            id="switch-label" 
            checked={this.props.challenge.enabled} 
            onChange={() => null}
          />
          <span className="slider round" onClick={this.toggleVisible}></span>
        </label>
      </div>
    )
  }
}

VisibilitySwitch.propTypes = {
  challenge: PropTypes.object,
  updateEnabled: PropTypes.func.isRequired
}

export default WithChallengeManagement(VisibilitySwitch)
