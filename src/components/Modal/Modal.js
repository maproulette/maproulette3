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
        <div
          className={classNames(
            "mr-z-90 mr-fixed mr-pin-t mr-pin-l", {
            "md:mr-w-2/3 md:mr-pin-t-5 md:mr-pin-l-16": this.props.wide,
            "md:mr-min-w-1/3 md:mr-w-1/3 md:mr-pin-t-5 md:mr-pin-l-33": this.props.narrow,
            "md:mr-min-w-2/5 md:mr-w-2/5 md:mr-pin-t-15 md:mr-pin-l-30": this.props.medium,
            "md:mr-min-w-1/2 mr-w-full lg:mr-w-auto lg:mr-pin-t-50 lg:mr-pin-l-50 lg:mr--translate-1/2": !this.props.wide && !this.props.narrow && !this.props.medium
          })}
        >
          <div
            className={classNames(
              'mr-relative mr-bg-blue-dark mr-p-8 mr-rounded mr-shadow mr-w-full mr-w-full mr-w-md mr-mx-auto mr-overflow-y-auto mr-max-h-screen100',
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
  wide: PropTypes.bool,
}

Modal.defaultProps = {
  wide: false,
}

export default Modal
