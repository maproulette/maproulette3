import _keys from "lodash/keys";
import _map from "lodash/map";
import { Component, Fragment } from "react";
import { FormattedMessage } from "react-intl";
import { messagesByStatus } from "../../services/Task/TaskStatus/TaskStatus";
import FilterDropdown from "./FilterDropdown";
import messages from "./Messages";
import TaskFilterIndicator from "./TaskFilterIndicator";

/**
 * TaskStatusFilter builds a dropdown for searching by task status
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskStatusFilter extends Component {
  render() {
    const taskStatusOptions = _keys(this.props.includeTaskStatuses);
    const allOn = Object.values(this.props.includeTaskStatuses).every((value) => value);

    const areFiltersActive =
      !allOn ||
      Object.keys(this.props.includeTaskStatuses).length < Object.keys(taskStatusOptions).length;

    return (
      <div className="mr-flex mr-space-x-1 mr-items-center">
        {areFiltersActive && <TaskFilterIndicator />}
        <FilterDropdown
          title={<FormattedMessage {...messages.filterByStatusLabel} />}
          filters={
            <Fragment>
              {this.props.setAllIncludedTaskStatuses && (
                <li className="mr-mb-2 mr-pb-2 mr-border-b mr-border-grey">
                  <button
                    type="button"
                    className="mr-text-green-lighter mr-text-xs mr-uppercase"
                    onClick={() => this.props.setAllIncludedTaskStatuses(!allOn)}
                  >
                    <FormattedMessage
                      {...(allOn ? messages.selectNoneLabel : messages.selectAllLabel)}
                    />
                  </button>
                </li>
              )}
              {_map(taskStatusOptions, (status) => (
                <li key={status}>
                  <label htmlFor={status} className="mr-flex mr-items-center">
                    <input
                      id={status}
                      className="mr-checkbox-toggle mr-mr-2"
                      type="checkbox"
                      checked={this.props.includeTaskStatuses[status]}
                      onChange={(e) =>
                        this.props.toggleIncludedTaskStatus(status, e.nativeEvent.shiftKey)
                      }
                    />
                    <FormattedMessage {...messagesByStatus[status]} />
                  </label>
                </li>
              ))}
            </Fragment>
          }
        />
      </div>
    );
  }
}
