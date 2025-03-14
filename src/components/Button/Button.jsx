import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { getEditorWindowReference, setEditorWindowReference } from "../../services/Editor/Editor";

/**
 * Basic button component that includes proper styling for disabled state
 * and optional link wrapping
 */
export default function Button({
  className,
  disabled = false,
  children,
  href,
  onClick,
  ...otherProps
}) {
  // If href is provided, wrap the button in an anchor tag
  if (href && !disabled) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        disabled={disabled}
        {...otherProps}
        className={classNames("mr-button", className, {
          "mr-opacity-50 mr-cursor-not-allowed": disabled,
        })}
        onClick={(e) => {
          e.preventDefault();
          if (onClick) {
            const existingEditor = getEditorWindowReference();
            if (existingEditor && !existingEditor.closed) {
              existingEditor.focus();
              onClick(e);
            } else {
              const newWindow = window.open(href, "_blank");
              setEditorWindowReference(newWindow);
              onClick(e);
            }
          }
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classNames("mr-button", className, {
        "mr-opacity-50 mr-cursor-not-allowed": disabled,
      })}
      disabled={disabled}
      onClick={onClick}
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
  href: PropTypes.string,
  onClick: PropTypes.func,
};
