import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

/**
 * Modal displays a Bulma modal dialogue if the `isActive` prop is true.
 * Content of the dialog should be passed as children. It includes a background
 * that will invoke `onClose` if the user clicks off the modal. If a close
 * button is desired, it should be provided as part of the the modal content.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class Modal extends Component {
  render() {
    return (
      <div className={classNames('modal', {'is-active': this.props.isActive},
                                 this.props.className)}>
        <div className="modal-background mr-bg-blue-dark-75" onClick={this.props.onClose} />
        <div className={classNames("modal-content", this.props.contentClassName)}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

Modal.propTypes = {
  /** Determines if the modal is displayed or not */
  isActive: PropTypes.bool.isRequired,
  /** Invoked to close the  modal */
  onClose: PropTypes.func.isRequired,
}
