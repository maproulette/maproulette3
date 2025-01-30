import classNames from "classnames";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { TaskStatus } from "../../../../../services/Task/TaskStatus/TaskStatus";
import Button from "../../../../Button/Button";
import messages from "./Messages";
import classNames from "classnames";

/**
 * TaskSkipControl displays a control for marking a task with a skipped status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const TaskSkipControl = ({ complete, disabled, asLink }) => {
  const handleClick = () => !disabled && complete(TaskStatus.skipped);

  if (asLink) {
    return (
      <a onClick={handleClick} className={disabled ? "mr-cursor-not-allowed mr-opacity-50" : ""}>
        <FormattedMessage {...messages.skipLabel} />
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
      <FormattedMessage {...messages.skipLabel} />
    </Button>
  );
};

TaskSkipControl.propTypes = {
  /** Set to true to render in a minimized form */
  isMinimized: PropTypes.bool,
  /** Set to true to suppress display of control icon */
  suppressIcon: PropTypes.bool,
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
  /** Available keyboard shortcuts */
  keyboardShortcutGroups: PropTypes.object.isRequired,
  /** Invoked when keyboard shortcuts are to be active */
  activateKeyboardShortcut: PropTypes.func.isRequired,
  /** Invoked when keyboard shortcuts should no longer be active  */
  deactivateKeyboardShortcut: PropTypes.func.isRequired,
  /** Disable the control */
  disabled: PropTypes.bool,
  /** Set to true to render as a link */
  asLink: PropTypes.bool,
};

TaskSkipControl.defaultProps = {
  isMinimized: false,
  suppressIcon: false,
};

export default TaskSkipControl;
