import PropTypes from "prop-types";
import { Component, Fragment } from "react";
import { FormattedMessage } from "react-intl";
import BusySpinner from "../../../BusySpinner/BusySpinner";

/**
 * ProgressStatus displays a full-page busy spinner and shows
 * the current progress (if provided)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ProgressStatus extends Component {
  render() {
    if (!this.props.progressItem) {
      return null;
    }

    // Show a message and busy spinner. If we also have completion/progress
    // data, then show that too.
    return (
      <div className="mr-flex mr-justify-center mr-min-h-screen-50 mr-m-12">
        <div className="mr-bg-blue-dark-75 mr-w-3/4 mr-p-4 mr-flex mr-items-center mr-justify-center mr-text-center">
          <div className="mr-flex-col mr-items-center mr-text-center">
            <div className="mr-text-yellow mr-text-4xl mr-mb-4">
              <FormattedMessage {...this.props.progressHeader} />
            </div>

            <div className="mr-white mr-text-lg">
              {Number.isFinite(this.props.progressItem.stepsCompleted) && (
                <Fragment>
                  {this.props.progressItem.stepsCompleted}{" "}
                  <FormattedMessage {...this.props.progressDescription} />
                </Fragment>
              )}
              <BusySpinner className="mr-mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProgressStatus.propTypes = {
  progressItem: PropTypes.object,
};
