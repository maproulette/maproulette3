import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

/**
 * Basic button component that includes proper styling for disabled state
 */
export default function Button({
  className,
  disabled = false,
  children,
  ...otherProps
}) {
  return (
    <button
      className={classNames("mr-button", className, {
        "mr-opacity-50 mr-cursor-not-allowed": disabled,
      })}
      disabled={disabled}
      {...otherProps}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
};
