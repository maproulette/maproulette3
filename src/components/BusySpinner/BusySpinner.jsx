import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import "./BusySpinner.scss";

/**
 * BusySpinner displays a simple busy spinner. By default, it's shown centered
 * in a block, but the `inline` prop can be given to display it inline.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */

const BusySpinner = ({ inline, big, xlarge, lightMode, mapMode, className }) => {
  const sizeClass = big ? "size-medium" : xlarge ? "size-large" : "size-small";
  const colorClass = lightMode ? "color-dark" : mapMode ? "color-grey" : "color-light";

  return (
    <div
      className={classNames(
        "busy-spinner",
        {
          "has-centered-children": !inline,
          inline: inline,
        },
        className,
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <div className={classNames("spinner", sizeClass, colorClass)} />
    </div>
  );
};

BusySpinner.propTypes = {
  /** display spinner inline, as opposed to a centered block */
  inline: PropTypes.bool,
  big: PropTypes.bool,
  xlarge: PropTypes.bool,
  lightMode: PropTypes.bool,
  mapMode: PropTypes.bool,
  className: PropTypes.string,
};

BusySpinner.defaultProps = {
  inline: false,
  big: false,
  xlarge: false,
  lightMode: false,
  mapMode: false,
  className: "",
};

export default BusySpinner;
