import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import './StepNavigation.css'

/**
 * Steps renders a Bulma Steps (extension) component with the given steps.  It
 * numbers the steps from 1 based off the index of each step. An optional name
 * can be given for each step, in which case it'll be displayed as well.
 *
 * @see See https://aramvisser.github.io/bulma-steps
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class Steps extends Component {
  render() {
    return (
      <div className="step-navigation" key={`step-${this.props.activeStep}`}>
        {this.props.activeStep > 0 &&
          <p className="control">
            <button className="button is-secondary is-outlined has-svg-icon"
                    disabled={!this.props.canPrev()}
                    onClick={this.props.prevStep}>
              <SvgSymbol viewBox='0 0 20 20' sym="arrow-left-icon" />
              <span>Prev</span>
            </button>
          </p>
        }

        {this.props.activeStep < this.props.steps.length - 1 &&
          <p className="control">
            <button className="button is-primary is-outlined has-svg-icon"
                    disabled={!this.props.canNext()}
                    onClick={this.props.nextStep}>
              <span>Next</span>
              <SvgSymbol viewBox='0 0 20 20' sym="arrow-right-icon" />
            </button>
          </p>
        }

        {this.props.activeStep === this.props.steps.length - 1 &&
          <p className="control">
            <button className="button is-primary is-outlined has-svg-icon"
                    disabled={!this.props.canNext()}
                    onClick={this.props.finish}>
              <SvgSymbol viewBox='0 0 20 20' sym="check-icon" />
              <span>Finish</span>
            </button>
          </p>
        }
      </div>
    )
  }
}

Steps.propTypes = {
  /** Array of steps in the workflow */
  steps: PropTypes.array.isRequired,
  /** The (zero-based) index of the currently active step. */
  activeStep: PropTypes.number,
  /** Invoked to determine whether Prev button should be active */
  canPrev: PropTypes.func.isRequired,
  /** Invoked to determine whether Next button should be displayed */
  canNext: PropTypes.func.isRequired,
  /** Invoked when user clicks the Prev button */
  prevStep: PropTypes.func.isRequired,
  /** Invoked when user clicks the Next button */
  nextStep: PropTypes.func.isRequired,
  /** Invoked when user clicks the finish button on the final step */
  finish: PropTypes.func.isRequired,
}

Steps.defaultProps = {
  steps: [],
  activeStep: 0,
}
