import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

class Modal extends Component {
  render() {
    return (
      <div
        className={classNames(
          { 'mr-hidden': !this.props.isActive },
          { 'mr-flex': this.props.isActive },
          this.props.className
        )}
      >
        <div
          className={classNames(
            "mr-fixed mr-top-0 mr-bottom-0 mr-left-0 mr-right-0 mr-z-200",
            {"mr-bg-blue-dark-75": !this.props.transparentOverlay}
          )}
          onClick={() => this.props.onClose && this.props.onClose()}
        />
        <div
          className={classNames(
            "mr-z-250 mr-fixed mr-top-0 mr-left-0", {
            "md:mr-w-2/3 md:mr-top-5 md:mr-left-16": this.props.wide,
            "md:mr-min-w-1/3 md:mr-w-1/3 md:mr-top-5 md:mr-left-33": this.props.narrow,
            "mr-w-full md:mr-w-1/4 md:mr-top-5 md:mr-left-37": this.props.extraNarrow,
            "md:mr-min-w-2/5 md:mr-w-2/5 md:mr-top-15 md:mr-left-30": this.props.medium,
            "md:mr-min-w-1/2 mr-w-full lg:mr-w-auto lg:mr-top-50 lg:mr-left-50 lg:mr--translate-1/2": !this.props.wide && !this.props.narrow && !this.props.extraNarrow && !this.props.medium
          })}
        >
          <div
            className={classNames(
              {'mr-p-8': !this.props.fullBleed},
              'mr-relative mr-bg-blue-dark mr-rounded mr-shadow mr-w-full mr-w-full mr-w-md mr-mx-auto mr-overflow-y-auto mr-max-h-screen100 mr-min-w-72',
              this.props.contentClassName
            )}
          >
            {this.props.onClose &&
             <button
               onClick={this.props.onClose}
               className="mr-absolute mr-top-0 mr-right-0 mr-mr-4 mr-mt-4 mr-transition mr-text-green-lighter hover:mr-text-white"
             >
               <SvgSymbol
                 sym="close-outline-icon"
                 viewBox="0 0 20 20"
                 className="mr-fill-current mr-w-5 mr-h-5"
               />
             </button>
            }
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}

Modal.propTypes = {
  onClose: PropTypes.func,
  isActive: PropTypes.bool.isRequired,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  fullBleed: PropTypes.bool,
  transparentOverlay: PropTypes.bool,
  wide: PropTypes.bool,
}

Modal.defaultProps = {
  fullBleed: false,
  transparentOverlay: false,
  wide: false,
}

export default Modal
