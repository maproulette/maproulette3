import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import FilterDropdown from './FilterDropdown'
import _map from 'lodash/map'
import _keys from 'lodash/keys'
import { TaskStatus, messagesByStatus } from '../../services/Task/TaskStatus/TaskStatus'
import messages from './Messages'

// Allowed task status options are more limited in the context of the task bundling widget
const VALID_TASK_BUNDLE_TASK_STATUSES = {
  created: [TaskStatus.created],
  skipped: [TaskStatus.skipped],
  tooHard: [TaskStatus.tooHard]
}
/**
 * TaskStatusFilter builds a dropdown for searching by task status
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskStatusFilter extends Component {
  render() {
    const {isUsedInTaskBundleContext} = this.props
    const taskStatusOptions = 
      isUsedInTaskBundleContext ?
      VALID_TASK_BUNDLE_TASK_STATUSES :
      _keys(this.props.includeTaskStatuses)

    return (
      <FilterDropdown
        title={<FormattedMessage {...messages.filterByStatusLabel} />}
        filters={
          _map(taskStatusOptions, status => (
            <li key={status}>
              <label className="mr-flex mr-items-center">
                <input
                  className="mr-checkbox-toggle mr-mr-2"
                  type="checkbox"
                  checked={this.props.includeTaskStatuses[status]}
                  onChange={(e) =>
                    this.props.toggleIncludedTaskStatus(status,
                                                        e.nativeEvent.shiftKey)
                  } />
                <FormattedMessage {...messagesByStatus[status]} />
              </label>
            </li>
          ))
        }
      />
    )
  }
}
