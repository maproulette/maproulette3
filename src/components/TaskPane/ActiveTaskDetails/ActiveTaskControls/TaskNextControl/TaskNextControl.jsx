import classNames from "classnames";
import _noop from "lodash/noop";
import PropTypes from "prop-types";
import { Component, Fragment } from "react";
import { FormattedMessage } from "react-intl";
import {
  TaskLoadMethod,
  messagesByLoadMethod,
} from "../../../../../services/Task/TaskLoadMethod/TaskLoadMethod";
import External from "../../../../External/External";
import Modal from "../../../../Modal/Modal";
import TaskNearbyList from "../../../TaskNearbyList/TaskNearbyList";
import messages from "./Messages";

/**
 * TaskNextControl displays a control for loading a new task without altering
 * the status of the current task. It's intended to be displayed for tasks that
 * have already been given a status, offering the user a chance to move on to
 * another task.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskNextControl extends Component {
  state = {
    chooseNearbyTasks: false,
  };

  render() {
    const disabled = this.props.disabled || this.props.isCompleting;

    const loadNearbyModal = (
      <External>
        <Modal
          contentClassName="mr-pb-6"
          medium
          isActive
          onClose={() => {
            this.props.clearNextTask();
            this.setState({ chooseNearbyTasks: false });
          }}
        >
          <div className="mr-flex mr-justify-center">
            <div>
              <h4 className="mr-mb-4 mr-text-yellow mr-text-center">
                <FormattedMessage {...messages.nextNearbyLabel} />
              </h4>
              <div className="mr-h-112 mr-w-88 mr-mb-4">
                <TaskNearbyList
                  {...this.props}
                  onTaskClick={this.props.chooseNextTask}
                  onMapClick={this.props.clearNextTask}
                  excludeSelfLockedTasks
                />
              </div>
              <button
                className={classNames(
                  "mr-button mr-button--white",
                  this.props.className
                )}
                style={{ width: "24rem" }}
                onClick={() => {
                  this.props.nextTask(
                    this.props.task.parent.id,
                    this.props.task.id
                  );
                  this.setState({ chooseNearbyTasks: false });
                }}
                title={this.props.intl.formatMessage(messages.nextTooltip)}
              >
                <FormattedMessage {...messages.nextLabel} />
              </button>
            </div>
          </div>
        </Modal>
      </External>
    );

    return (
      <div>
        {this.state.chooseNearbyTasks && loadNearbyModal}
        {!this.state.chooseNearbyTasks && (
          <Fragment>
            <button
              className={classNames(
                "mr-button mr-button--white",
                this.props.className
              )}
              style={{ width: "20.5rem" }}
              onClick={() => {
                if (this.props.loadBy === TaskLoadMethod.proximity) {
                  this.setState({ chooseNearbyTasks: true });
                } else {
                  this.props.nextTask(
                    this.props.task.parent.id,
                    this.props.task.id
                  );
                }
              }}
              title={this.props.intl.formatMessage(messages.nextTooltip)}
              disabled={disabled}
            >
              <FormattedMessage {...messages.nextLabel} />
            </button>

            <div className="mr-mt-2">
              <div className="form">
                <span className="mr-mr-4">
                  <FormattedMessage {...messages.loadByLabel} />
                </span>
                <input
                  type="radio"
                  name="randomnessPreference"
                  id="randomnessPreference-random"
                  className="mr-radio mr-mr-1"
                  checked={this.props.loadBy === TaskLoadMethod.random}
                  onClick={() => this.props.chooseLoadBy(TaskLoadMethod.random)}
                  onChange={_noop}
                  disabled={disabled}
                />
                <label
                  className="mr-ml-1 mr-mr-4"
                  htmlFor="randomnessPreference-random"
                >
                  <FormattedMessage
                    {...messagesByLoadMethod[TaskLoadMethod.random]}
                  />
                </label>

                <input
                  type="radio"
                  name="randomnessPreference"
                  id="randomnessPreference-proximity"
                  className="mr-radio mr-mr-1"
                  checked={this.props.loadBy === TaskLoadMethod.proximity}
                  onClick={() =>
                    this.props.chooseLoadBy(TaskLoadMethod.proximity)
                  }
                  onChange={_noop}
                  disabled={disabled}
                />
                <label
                  className="mr-ml-1"
                  htmlFor="randomnessPreference-proximity"
                >
                  <FormattedMessage
                    {...messagesByLoadMethod[TaskLoadMethod.proximity]}
                  />
                </label>
              </div>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}

TaskNextControl.propTypes = {
  /** The current active task */
  task: PropTypes.object.isRequired,
  /** Invoked if the user desires to load a new task */
  nextTask: PropTypes.func.isRequired,
};
