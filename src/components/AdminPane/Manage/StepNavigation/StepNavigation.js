import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './StepNavigation.scss'

/**
 * StepNavigation renders cancel, prev, next, and finish controls, as
 * appropriate, for a multi-step editing workflow.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class StepNavigation extends Component {
  render() {
    return (
      <div className="step-navigation" key={`step-${this.props.activeStep}`}>
        <button type="button" className="button is-secondary is-outlined"
                onClick={this.props.cancel}>
          <FormattedMessage {...messages.cancel} />
        </button>

        <div className="button-group">
          {this.props.activeStep > 0 &&
            <button type="button" className="button is-secondary is-outlined has-svg-icon"
                    onClick={this.props.prevStep}>
              <SvgSymbol viewBox='0 0 20 20' sym="arrow-left-icon" />
              <FormattedMessage {...messages.prev} />
            </button>
          }

          {this.props.activeStep < this.props.steps.length - 1 &&
            <button type="submit"
                    className="button is-primary is-outlined has-svg-icon">
              <FormattedMessage {...messages.next} />
              <SvgSymbol viewBox='0 0 20 20' sym="arrow-right-icon" />
            </button>
          }

          {(this.props.activeStep === this.props.steps.length - 1 ||
            this.props.canFinishEarly) &&
            <button type="submit"
                    className="button is-green is-outlined has-svg-icon"
                    onClick={() => this.props.finish && this.props.finish()}>
              <SvgSymbol viewBox='0 0 20 20' sym="check-icon" />
              <FormattedMessage {...messages.finish} />
            </button>
          }
        </div>
      </div>
    )
  }
}

StepNavigation.propTypes = {
  /** Array of steps in the workflow */
  steps: PropTypes.array.isRequired,
  /** The (zero-based) index of the currently active step. */
  activeStep: PropTypes.number,
  /** Invoked when user clicks the Prev button */
  prevStep: PropTypes.func.isRequired,
  /** Invoked when the user clicks the cancel button */
  cancel: PropTypes.func.isRequired,
  /** Invoked, if provided, when user finishes workflow */
  finish: PropTypes.func,
  /** Set to true to allow users to finish the workflow early */
  canFinishEarly: PropTypes.bool,
}

StepNavigation.defaultProps = {
  steps: [],
  activeStep: 0,
  canFinishEarly: false,
}
