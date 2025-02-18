import _map from "lodash/map";
import _reverse from "lodash/reverse";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { TaskPriority, messagesByPriority } from "../../services/Task/TaskPriority/TaskPriority";
import FilterDropdown from "./FilterDropdown";
import messages from "./Messages";
import TaskFilterIndicator from "./TaskFilterIndicator";

/**
 * TaskPriorityFilter builds a dropdown for searching by task priority
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskPriorityFilter extends Component {
  render() {
    const areFiltersActive =
      !Object.values(this.props.includeTaskPriorities).every((value) => value) ||
      Object.keys(this.props.includeTaskPriorities).length < Object.keys(TaskPriority).length;

    return (
      <div className="mr-flex mr-space-x-1 mr-items-center">
        {areFiltersActive && <TaskFilterIndicator />}
        <FilterDropdown
          title={<FormattedMessage {...messages.filterByPriorityLabel} />}
          filters={_reverse(
            _map(TaskPriority, (priority) => (
              <li key={priority}>
                <label htmlFor={priority} className="mr-flex mr-items-center">
                  <input
                    id={priority}
                    className="mr-checkbox-toggle mr-mr-2"
                    type="checkbox"
                    checked={this.props.includeTaskPriorities[priority]}
                    onChange={(e) =>
                      this.props.toggleIncludedTaskPriority(priority, e.nativeEvent.shiftKey)
                    }
                  />
                  <FormattedMessage {...messagesByPriority[priority]} />
                </label>
              </li>
            )),
          )}
        />
      </div>
    );
  }
}
