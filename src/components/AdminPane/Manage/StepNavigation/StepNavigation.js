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
        <button
          type="button"
          className="mr-button mr-button--white"
          onClick={this.props.cancel}
        >
          <FormattedMessage {...messages.cancel} />
        </button>

        <div className="mr-flex mr-justify-between mr-items-center">
          <div>
            {this.props.activeStep > 0 &&
            <button
              type="button"
              className="mr-button mr-button--green-lighter mr-button--with-icon"
              onClick={this.props.prevStep}
            >
              <SvgSymbol
                viewBox='0 0 20 20'
                sym="arrow-left-icon"
                className="mr-fill-current mr-w-4 mr-h-4 mr-mr-2"
              />
              <FormattedMessage {...messages.prev} />
            </button>
            }
          </div>

          <div className="mr-flex mr-justify-end mr-items-center">
            {this.props.activeStep < this.props.steps.length - 1 &&
            <button
              type="submit"
              className="mr-button mr-button--green-lighter mr-button--with-icon mr-ml-4"
            >
              <FormattedMessage {...messages.next} />
              <SvgSymbol
                viewBox='0 0 20 20'
                sym="arrow-right-icon"
                className="mr-fill-current mr-w-4 mr-h-4 mr-ml-2"
              />
            </button>
            }

            {(this.props.activeStep === this.props.steps.length - 1 ||
              this.props.canFinishEarly) &&
             <button
               type="submit"
               className="mr-button mr-button--green-lighter mr-button--with-icon mr-ml-4"
               onClick={() => this.props.finish && this.props.finish()}
             >
               <SvgSymbol
                 viewBox='0 0 20 20'
                 sym="check-icon"
                 className="mr-fill-current mr-w-4 mr-h-4 mr-mr-2"
               />
               <FormattedMessage {...messages.finish} />
             </button>
            }
          </div>
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
