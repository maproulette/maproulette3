import classNames from "classnames";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { TaskStatus } from "../../../../../services/Task/TaskStatus/TaskStatus";
import Button from "../../../../Button/Button";
import messages from "./Messages";

/**
 * TaskFixedControl displays a control for marking a task with a fixed status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const TaskFixedControl = ({ complete, disabled, asLink, fixedLabel }) => {
  const handleClick = () => !disabled && complete(TaskStatus.fixed);

  const label = fixedLabel || <FormattedMessage {...messages.fixedLabel} />;

  if (asLink) {
    return (
      <a onClick={handleClick} className={disabled ? "mr-cursor-not-allowed mr-opacity-50" : ""}>
        {label}
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
      {label}
    </Button>
  );
};

TaskFixedControl.propTypes = {
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
  /** Disable the control */
  disabled: PropTypes.bool,
  asLink: PropTypes.bool,
  fixedLabel: PropTypes.node,
};

export default TaskFixedControl;
