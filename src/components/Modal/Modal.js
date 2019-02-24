import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

class Modal extends Component {
  render() {
    return (
      <div
        className={classNames(
          'mr-hidden',
          { 'mr-flex': this.props.isActive },
          this.props.className
        )}
      >
        <div
          className="mr-fixed mr-pin mr-z-40 mr-bg-blue-dark-75"
          onClick={this.props.onClose}
        />
        <div className="mr-z-50 mr-fixed mr-pin-t mr-pin-l mr-w-full lg:mr-w-auto lg:mr-pin-t-50 lg:mr-pin-l-50 lg:mr--translate-1/2">
          <div
            className={classNames(
              'mr-relative mr-bg-blue-dark mr-p-8 mr-rounded mr-shadow mr-max-w-full mr-w-md mr-mx-auto',
              this.props.contentClassName
            )}
          >
            <button
              onClick={this.props.onClose}
              className="mr-absolute mr-pin-t mr-pin-r mr-mr-4 mr-mt-4 mr-transition mr-text-green-lighter hover:mr-text-white"
            >
              <SvgSymbol
                sym="close-outline-icon"
                viewBox="0 0 20 20"
                className="mr-fill-current mr-w-5 mr-h-5"
              />
            </button>
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
}

export default Modal
