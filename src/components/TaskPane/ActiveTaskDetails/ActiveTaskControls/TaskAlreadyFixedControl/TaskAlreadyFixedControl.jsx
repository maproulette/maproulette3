import classNames from "classnames";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { TaskStatus } from "../../../../../services/Task/TaskStatus/TaskStatus";
import Button from "../../../../Button/Button";
import messages from "./Messages";

/**
 * TaskAlreadyFixedControl displays the a control for marking a task with an
 * already-fixed status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const TaskAlreadyFixedControl = ({ complete, disabled, asLink }) => {
  const handleClick = () => !disabled && complete(TaskStatus.alreadyFixed);

  if (asLink) {
    return (
      <a onClick={handleClick} className={disabled ? "mr-cursor-not-allowed mr-opacity-50" : ""}>
        <FormattedMessage {...messages.alreadyFixedLabel} />
      </a>
    );
  }

  return (
    <Button
      className={classNames("mr-button--blue-fill mr-mb-2 mr-mr-2", {
        "mr-opacity-50 mr-cursor-not-allowed": disabled,
      })}
      style={{ minWidth: "10rem" }}
      onClick={handleClick}
      disabled={disabled}
    >
      <FormattedMessage {...messages.alreadyFixedLabel} />
    </Button>
  );
};

TaskAlreadyFixedControl.propTypes = {
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
  /** Disable the control */
  disabled: PropTypes.bool,
  /** Whether the control should be rendered as a link */
  asLink: PropTypes.bool,
};

export default TaskAlreadyFixedControl;
