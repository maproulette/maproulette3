import PropTypes from "prop-types";
import { Component } from "react";
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
export default class TaskAlreadyFixedControl extends Component {
  render() {
    if (this.props.asLink) {
      return (
        <a onClick={() => this.props.complete(TaskStatus.alreadyFixed)}>
          <FormattedMessage {...messages.alreadyFixedLabel} />
        </a>
      );
    } else {
      return (
        <Button
          className="mr-button--blue-fill mr-mb-2 mr-mr-2"
          style={{ minWidth: "10rem" }}
          onClick={() => this.props.complete(TaskStatus.alreadyFixed)}
        >
          <FormattedMessage {...messages.alreadyFixedLabel} />
        </Button>
      );
    }
  }
}

TaskAlreadyFixedControl.propTypes = {
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
};
