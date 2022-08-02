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

    console.log(this.props.challenge.enabled, this.props.label)

    return (
      <div className="mr-flex mr-justify-center">
        {/* <div>
          <div className="mr-form-check mr-form-switch" onClick={this.toggleVisible}>
            <input type="checkbox" role="switch"
              className="mr-form-check-input form-check-input mr-appearance-none mr-w-9 mr-ml-10 mr-rounded-full mr-float-left mr-h-5 mr-align-top mr-bg-white mr-bg-no-repeat mr-bg-contain mr-bg-gray-300 mr-focus:outline-none mr-cursor-pointer mr-shadow-sm"
              // disabled={this.props.disabled}
              onChange={() => null} />
            <label className="mr-form-check-label mr-inline-block mr-text-gray-800">{this.props.label}</label>
          </div>
        </div> */}

<div className="mr-flex mr-justify-center">
  <div className="mr-form-check mr-form-switch">
    <input 
              checked={this.props.challenge.enabled}
              className="mr-form-check-input mr-appearance-none mr-w-9 mr--ml-10 mr-rounded-full mr-float-left mr-h-5 mr-align-top mr-bg-white mr-bg-no-repeat mr-bg-contain mr-bg-gray-300 mr-focus:outline-none mr-cursor-pointer mr-shadow-sm" type="checkbox" role="switch" id="flexSwitchCheckDefault" />
    <label className="mr-form-check-label mr-inline-block mr-text-gray-800" for="flexSwitchCheckDefault">Default switch checkbox input</label>
  </div>
</div>
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
