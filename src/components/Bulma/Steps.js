import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _map from 'lodash/map'
import _isString from 'lodash/isString'
import './Steps.scss'

/**
 * Steps renders a Bulma Steps (extension) component with the given steps. It
 * numbers the steps from 1 based off the index of each step. An optional name
 * can be given for each step, in which case it'll be displayed as well.
 *
 * @see See https://aramvisser.github.io/bulma-steps
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class Steps extends Component {
  render() {
    const steps = _map(this.props.steps, (step, index) => (
      <li key={`step-${index}`}
          className={classNames("steps-segment",
                                {"is-active": this.props.activeStep === index})}
          onClick={() => this.props.onStepClick && this.props.onStepClick(index)}
      >
        <span className={classNames("steps-marker",
                                    {clickable: !!this.props.onStepClick})} />
        <div className="steps-content">
          {_isString(step.name) && <p className="is-size-6">{step.name}</p>}
        </div>
      </li>
    ))

    return <ul className="steps has-content-centered is-small is-narrow is-right">{steps}</ul>
  }
}

Steps.propTypes = {
  /** Array of steps in the workflow */
  steps: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
  })).isRequired,
  /** The (zero-based) index of the currently active step. */
  activeStep: PropTypes.number,
  /** Invoked on step click, passing the step number */
  onStepClick: PropTypes.func,
}

Steps.defaultProps = {
  steps: [],
  activeStep: 0,
}
