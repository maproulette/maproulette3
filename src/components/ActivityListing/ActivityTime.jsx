import classNames from "classnames";
import { formatDistanceToNow, parseISO } from "date-fns";
import PropTypes from "prop-types";
import { FormattedDate, FormattedTime, injectIntl } from "react-intl";

/**
 * Displays the timestamp for an activity entry, either relative or exact
 * depending on value of showExactDates prop
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const ActivityTime = (props) => {
  const timestamp = parseISO(props.entry.created);
  const created = `${props.intl.formatDate(timestamp)} ${props.intl.formatTime(timestamp)}`;

  const distanceToNow = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <div
      className={classNames("mr-whitespace-nowrap mr-leading-tight mr-capitalize mr-flex-grow-0", {
        "mr-text-yellow": !props.simplified,
      })}
      title={created}
    >
      {props.showExactDates ? (
        <span>
          <FormattedDate value={props.entry.created} />{" "}
          <FormattedTime value={props.entry.created} />
        </span>
      ) : (
        <span>{distanceToNow}</span>
      )}
    </div>
  );
};

ActivityTime.propTypes = {
  entry: PropTypes.object.isRequired,
  showExactDates: PropTypes.bool,
};

ActivityTime.defaultProps = {
  showExactDates: false,
};

export default injectIntl(ActivityTime);
