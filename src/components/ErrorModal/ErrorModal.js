import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _isArray from 'lodash/isArray'
import { errorShape } from '../../services/Error/Error'
import WithErrors from '../HOCs/WithErrors/WithErrors'
import Modal from '../Bulma/Modal'
import './ErrorModal.scss'

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
      return null
    }

    const errorMessages = this.props.errors.map(error => (
      <li key={error.id}>
        <article className="message is-danger">
          <div className="message-header">
            <p>Error</p>
            <button className="delete" aria-label="delete"
                    onClick={() => this.props.removeError(error)} />
          </div>
          <div className="message-body">
            <FormattedMessage {...error} />
          </div>
        </article>
      </li>
    ))

    return (
      <Modal className="error-pane" onClose={this.props.clearErrors} isActive={true}>
        <ul className="error-pane__messages">{errorMessages}</ul>
      </Modal>
    )
  }
}

ErrorModal.propTypes = {
  /** The errors to display */
  errors: PropTypes.arrayOf(errorShape).isRequired,
  /** Invoked if a user clears an individual error */
  removeError: PropTypes.func.isRequired,
  /** Invoked if the user clears all the errors at once */
  clearErrors: PropTypes.func.isRequired,
}

ErrorModal.defaultProps = {
  errors: [],
}

export default WithErrors(ErrorModal)
