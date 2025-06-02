import classNames from "classnames";
import React from "react";
import { FormattedMessage } from "react-intl";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import { statusLabelStyles } from "../TableShared/TableStyles";

/**
 * Helper functions for building components related to tables.
 */

/**
 * Renders a status label with consistent styling
 */
export const StatusLabel = ({ value, intlMessage, className }) => {
  if (!value && value !== 0) return null;
  return (
    <span className={`${statusLabelStyles} ${className || ""}`}>
      <FormattedMessage {...intlMessage} />
    </span>
  );
};

/**
 * Renders a comments view button
 */
export const ViewCommentsButton = ({ onClick }) => (
  <button
    className="mr-text-green-lighter hover:mr-text-white mr-transition-colors mr-bg-transparent mr-border-none"
    onClick={onClick}
  >
    <svg
      className="mr-w-5 mr-h-5 mr-fill-current"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
    >
      <path d="M17 11v3l-3-3H8a2 2 0 01-2-2V2c0-1.1.9-2 2-2h10a2 2 0 012 2v7a2 2 0 01-2 2h-1zm-3 2v2a2 2 0 01-2 2H6l-3 3v-3H2a2 2 0 01-2-2V8c0-1.1.9-2 2-2h2v3a4 4 0 004 4h6z" />
    </svg>
  </button>
);

/**
 * Helper to make column headers invertable (for sorting direction)
 */
export const makeInvertable = (header, onInvert, isInverted) => {
  return (
    <div className="mr-flex mr-items-center mr-gap-1">
      {header}
      <button
        className=""
        onClick={(e) => {
          e.stopPropagation();
          onInvert();
        }}
      >
        <SvgSymbol
          sym="inverse-arrow-icon"
          viewBox="0 0 20 20"
          className={`mr-w-4 mr-h-4 mr-fill-current ${
            isInverted ? "mr-text-pink" : "mr-text-grey"
          }`}
          style={{
            fill: isInverted ? "mr-text-pink" : "mr-text-grey",
            stroke: isInverted ? "mr-text-pink" : "mr-text-grey",
          }}
        />
      </button>
    </div>
  );
};

export const makeInputFilter = (inverted) => {
  return ({ filter, onChange }) => (
    <input
      onChange={(event) => onChange(event.target.value)}
      value={filter ? filter.value : ""}
      style={{ width: "100%" }}
      className={classNames({ "mr-line-through": inverted })}
    />
  );
};
