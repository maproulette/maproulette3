import _isEmpty from "lodash/isEmpty";
import _isString from "lodash/isString";
import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import messages from "./Messages";

/**
 * StepNavigation renders prev, next, and finish controls, as appropriate, for
 * a multi-step editing workflow
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class StepNavigation extends Component {
  render() {
    return (
      <div className="mr-flex mr-justify-between" key={`step-${this.props.activeStep.name}`}>
        <div className="mr-flex mr-items-center">
          {_isString(this.props.activeStep.previous) && (
            <button
              type="button"
              className="mr-button mr-button--green-lighter mr-button--with-icon mr-mr-4"
              onClick={() => this.props.prevStep()}
            >
              <SvgSymbol
                viewBox="0 0 20 20"
                sym="arrow-left-icon"
                className="mr-fill-current mr-w-4 mr-h-4 mr-mr-2"
              />
              <FormattedMessage {...messages.prev} />
            </button>
          )}

          {_isString(this.props.activeStep.next) && (
            <button
              type="submit"
              className="mr-button mr-button--green-lighter mr-button--with-icon mr-mr-4"
            >
              <FormattedMessage {...messages.next} />
              <SvgSymbol
                viewBox="0 0 20 20"
                sym="arrow-right-icon"
                className="mr-fill-current mr-w-4 mr-h-4 mr-ml-2"
              />
            </button>
          )}
        </div>

        <div className="mr-flex mr-justify-end mr-items-center">
          {(_isEmpty(this.props.activeStep.next) || this.props.activeStep.canFinish) && (
            <button
              type="submit"
              className="mr-button mr-button--green-lighter mr-button--with-icon mr-ml-4"
              onClick={() => this.props.finish && this.props.finish()}
            >
              <SvgSymbol
                viewBox="0 0 20 20"
                sym="check-icon"
                className="mr-fill-current mr-w-4 mr-h-4 mr-mr-2"
              />
              <FormattedMessage {...messages.finish} />
            </button>
          )}
        </div>
      </div>
    );
  }
}

StepNavigation.propTypes = {
  /** Object representing the currently active step. */
  activeStep: PropTypes.object.isRequired,
  /** Invoked when user clicks the Prev button */
  prevStep: PropTypes.func.isRequired,
  /** Invoked, if provided, when user finishes workflow */
  finish: PropTypes.func,
};
