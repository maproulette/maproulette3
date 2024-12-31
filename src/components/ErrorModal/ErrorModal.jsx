import _isArray from "lodash/isArray";
import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { errorShape } from "../../services/Error/Error";
import WithErrors from "../HOCs/WithErrors/WithErrors";
import Modal from "../Modal/Modal";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import messages from "./Messages";

/**
 * ErrorModal presents a modal that displays all of the given errors as individual
 * dialog boxes. Each box can be cleared individually by the user, or all errors
 * can be cleared at once if the user clicks off the dialogs.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ErrorModal extends Component {
  render() {
    if (!_isArray(this.props.errors) || this.props.errors.length === 0) {
      return null;
    }

    const errorMessages = this.props.errors.map((error) => (
      <li key={error.id}>
        <div className="mr-font-medium mr-mt-4">
          <FormattedMessage {...error} />
        </div>
      </li>
    ));

    return (
      <Modal onClose={this.props.clearErrors} isActive={true}>
        <div className="mr-top-0 mr-absolute">
          <SvgSymbol
            className="mr-fill-white-04 mr-w-48 mr-h-48 mr-mt-4 mr-ml-8"
            viewBox="0 0 20 20"
            sym="minus-outline-icon"
          />
        </div>
        <div className="mr-flex mr-flex-col mr-items-center">
          <div className="mr-w-full mr-flex mr-justify-center mr-mb-4">
            <SvgSymbol
              className="mr-fill-red mr-h-10 mr-h-10"
              viewBox="0 0 20 20"
              sym="minus-outline-icon"
            />
          </div>
          <div className="mr-text-3xl mr-mb-4">
            <FormattedMessage {...messages.title} />
          </div>
        </div>
        <ul className="mr-flex mr-flex-col mr-items-center">{errorMessages}</ul>
      </Modal>
    );
  }
}

ErrorModal.propTypes = {
  /** The errors to display */
  errors: PropTypes.arrayOf(errorShape).isRequired,
  /** Invoked if a user clears an individual error */
  removeError: PropTypes.func.isRequired,
  /** Invoked if the user clears all the errors at once */
  clearErrors: PropTypes.func.isRequired,
};

ErrorModal.defaultProps = {
  errors: [],
};

export default WithErrors(ErrorModal);
