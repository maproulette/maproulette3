import classNames from "classnames";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { TaskStatus } from "../../../../../services/Task/TaskStatus/TaskStatus";
import Button from "../../../../Button/Button";
import messages from "./Messages";

/**
 * TaskFalsePositiveControl displays a control for marking a task with a
 * false-positive status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const TaskFalsePositiveControl = ({ complete, disabled, asLink, falsePositiveLabel, intl }) => {
  const handleClick = () => !disabled && complete(TaskStatus.falsePositive);

  const label = falsePositiveLabel || <FormattedMessage {...messages.falsePositiveLabel} />;

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
      title={intl?.formatMessage(messages.falsePositiveTooltip)}
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

TaskFalsePositiveControl.propTypes = {
  /** Set to true to render in a minimized form */
  isMinimized: PropTypes.bool,
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
  /** Set to true to render in a link form */
  asLink: PropTypes.bool,
  /** Custom label for the false-positive control */
  falsePositiveLabel: PropTypes.node,
  /** React-intl intl object */
  intl: PropTypes.object,
};

TaskFalsePositiveControl.defaultProps = {
  isMinimized: false,
};

export default TaskFalsePositiveControl;
