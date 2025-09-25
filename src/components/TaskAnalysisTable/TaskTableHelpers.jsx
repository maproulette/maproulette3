import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import messages from "./Messages";

/**
 * Helper functions for building components related to tables.
 */

export const StatusLabel = (props) => {
  return (
    <span className={classNames("mr-inline-flex mr-items-center", props.className)}>
      <span className="mr-w-2 mr-h-2 mr-rounded-full mr-bg-current" />
      <span className="mr-ml-2 mr-text-xs mr-uppercase mr-tracking-wide">
        <FormattedMessage {...props.intlMessage} />
      </span>
    </span>
  );
};

export const ViewCommentsButton = function (props) {
  return (
    <button
      onClick={props.onClick}
      className="mr-inline-flex mr-items-center mr-transition mr-text-green-lighter hover:mr-text-white"
    >
      <SvgSymbol
        sym="comments-icon"
        viewBox="0 0 20 20"
        className="mr-fill-current mr-w-4 mr-h-4"
      />
    </button>
  );
};

export const makeInvertable = function (column, invert, isInverted) {
  return (
    <div className="mr-w-full">
      {column}
      <div className="mr-pl-2">
        <button
          className={classNames("mr-text-current mr-justify-center", {
            "mr-text-white-40": !isInverted,
            "mr-text-pink": isInverted,
          })}
          onClick={(e) => {
            e.stopPropagation();
            invert();
          }}
        >
          {isInverted ? (
            <FormattedMessage {...messages.invertedLabel} />
          ) : (
            <FormattedMessage {...messages.invertLabel} />
          )}
        </button>
      </div>
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
