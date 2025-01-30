import classNames from "classnames";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { TaskReviewStatus } from "../../../../../services/Task/TaskReview/TaskReviewStatus";
import Dropdown from "../../../../Dropdown/Dropdown";
import messages from "./Messages";

/**
 * TaskRevisedControl displays a control for marking a task as revision complete.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const MoreOptionsButton = ({ toggleDropdownVisible, intl }) => (
  <button
    className="mr-dropdown__button mr-button mr-text-green-lighter mr-mr-2"
    style={{ minWidth: "20.5rem" }}
    onClick={toggleDropdownVisible}
  >
    {intl.formatMessage(messages.revisedLabel)}&hellip;
  </button>
);

const ListMoreOptionsItems = ({ complete, task }) => (
  <ol className="mr-list-dropdown">
    <li>
      <a onClick={() => complete(task.status, TaskReviewStatus.needed)}>
        <FormattedMessage {...messages.resubmit} />
      </a>
    </li>
    <li>
      <a onClick={() => complete(task.status, TaskReviewStatus.disputed)}>
        <FormattedMessage {...messages.dispute} />
      </a>
    </li>
  </ol>
);

const TaskRevisedControl = ({ complete, asLink, intl, task }) => {
  if (asLink) {
    return (
      <a onClick={() => complete(TaskReviewStatus.needed)}>
        <FormattedMessage {...messages.revisedLabel} />
      </a>
    );
  }

  return (
    <Dropdown
      className={classNames("mr-dropdown--fixed")}
      dropdownButton={(dropdown) => (
        <MoreOptionsButton
          toggleDropdownVisible={dropdown.toggleDropdownVisible}
          intl={intl}
          disabled={disabled}
        />
      )}
      dropdownContent={() => (
        <ListMoreOptionsItems complete={complete} task={task} />
      )}
    />
  );
};

TaskRevisedControl.propTypes = {
  /** Invoked to mark the task as revised */
  complete: PropTypes.func.isRequired,
  asLink: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  task: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
};

MoreOptionsButton.propTypes = {
  toggleDropdownVisible: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
};

ListMoreOptionsItems.propTypes = {
  complete: PropTypes.func.isRequired,
  task: PropTypes.object.isRequired,
};

export default TaskRevisedControl;
