import classNames from "classnames";
import PropTypes from "prop-types";
import { Component } from "react";
import SvgSymbol from "../SvgSymbol/SvgSymbol";

class Modal extends Component {
  render() {
    return (
      <div
        className={classNames(
          "mr-fixed mr-inset-0 mr-flex mr-items-center mr-justify-center",
          { "mr-hidden": !this.props.isActive },
          this.props.className,
        )}
      >
        <div
          className={classNames("mr-fixed mr-inset-0 mr-z-200", {
            "mr-bg-blue-firefly-75": !this.props.transparentOverlay,
          })}
          onClick={() => this.props.onClose && this.props.onClose()}
        />
        <div
          className={classNames("mr-z-250 mr-relative", {
            "mr-max-w-screen80": !this.props.fullScreen,
            "mr-w-full mr-h-full": this.props.fullScreen,
            "mr-w-4/5": this.props.extraWide,
            "mr-w-2/3": this.props.wide,
            "mr-w-1/3": this.props.narrow,
            "mr-w-1/4": this.props.extraNarrow,
            "mr-w-2/5": this.props.medium,
            [this.props.customWidth]: this.props.customWidth,
            "mr-w-3/5":
              !this.props.extraWide &&
              !this.props.wide &&
              !this.props.narrow &&
              !this.props.fullScreen &&
              !this.props.extraNarrow &&
              !this.props.medium &&
              !this.props.customWidth,
          })}
        >
          <div
            className={classNames(
              "mr-relative mr-bg-blue-dark mr-rounded mr-shadow mr-w-full mr-mx-auto mr-max-h-screen90",
              {
                "mr-p-8": !this.props.fullBleed,
                "mr-overflow-y-auto": !this.props.allowOverflow,
                "mr-h-full": this.props.fullScreen,
                "mr-overflow-visible": this.props.allowOverflow,
              },
              this.props.contentClassName,
            )}
          >
            {this.props.onClose && (
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
            )}
            {this.props.children}
          </div>
        </div>
      </div>
    );
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
  extraWide: PropTypes.bool,
  narrow: PropTypes.bool,
  extraNarrow: PropTypes.bool,
  medium: PropTypes.bool,
  fullScreen: PropTypes.bool,
  allowOverflow: PropTypes.bool,
  customWidth: PropTypes.string,
};

Modal.defaultProps = {
  fullBleed: false,
  transparentOverlay: false,
  wide: false,
};

export default Modal;
