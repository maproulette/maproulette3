import classNames from "classnames";
import PropTypes from "prop-types";
import { Component } from "react";
import SvgSymbol from "../SvgSymbol/SvgSymbol";

class Modal extends Component {
  render() {
    return (
      <div
        className={classNames(
          { "mr-hidden": !this.props.isActive },
          { "mr-flex": this.props.isActive },
          "mr-fixed mr-inset-0 mr-z-200 mr-items-center mr-justify-center",
          this.props.className,
        )}
      >
        <div
          className={classNames("mr-fixed mr-top-0 mr-bottom-0 mr-left-0 mr-right-0 mr-z-200", {
            "mr-bg-blue-firefly-75": !this.props.transparentOverlay,
          })}
          onClick={() => this.props.onClose && this.props.onClose()}
        />
        <div
          className={classNames(
            "mr-z-250 mr-fixed",
            "md:mr-top-50 md:mr-left-50 md:mr--translate-1/2 mr-max-h-screen mr-overflow-y-auto",
            {
              "mr-max-w-full": !this.props.fullScreen,
              "mr-w-full mr-h-full mr-top-0 mr-left-0": this.props.fullScreen,
              "md:mr-w-4/5": this.props.extraWide,
              "md:mr-w-2/3": this.props.wide,
              "md:mr-min-w-1/3 md:mr-w-1/3": this.props.narrow,
              "mr-w-full md:mr-w-1/4": this.props.extraNarrow,
              "md:mr-min-w-2/5 md:mr-w-2/5": this.props.medium,
              "md:mr-min-w-screen50 lg:mr-max-w-screen60 mr-w-full":
                !this.props.extraWide &&
                !this.props.wide &&
                !this.props.narrow &&
                !this.props.fullScreen &&
                !this.props.extraNarrow &&
                !this.props.medium,
            },
          )}
        >
          <div
            className={classNames(
              {
                "mr-p-8": !this.props.fullBleed,
                "mr-overflow-y-auto mr-overflow-x-auto": !this.props.allowOverflow,
                "mr-h-full": this.props.fullScreen,
                "mr-overflow-visible": this.props.allowOverflow,
              },
              "mr-relative mr-bg-blue-dark mr-rounded mr-shadow mr-w-full mr-mx-auto mr-max-h-screen90 mr-min-w-72",
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
  allowOverflow: PropTypes.bool,
};

Modal.defaultProps = {
  fullBleed: false,
  transparentOverlay: false,
  wide: false,
};

export default Modal;
