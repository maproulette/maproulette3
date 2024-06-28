import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import FilterDropdown from './FilterDropdown'
import TaskFilterIndicator from './TaskFilterIndicator'
import _map from 'lodash/map'
import _keys from 'lodash/keys'
import { messagesByStatus } from '../../services/Task/TaskStatus/TaskStatus'
import messages from './Messages'

/**
 * TaskStatusFilter builds a dropdown for searching by task status
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskStatusFilter extends Component {
  render() {
    const taskStatusOptions = _keys(this.props.includeTaskStatuses)

    const areFiltersActive = !Object.values(this.props.includeTaskStatuses).every(value => value) || 
      Object.keys(this.props.includeTaskStatuses).length < Object.keys(taskStatusOptions).length
    
    return (
      <div className='mr-flex mr-space-x-1 mr-items-center'>
        {areFiltersActive && <TaskFilterIndicator />}
        <FilterDropdown
          title={<FormattedMessage {...messages.filterByStatusLabel} />}
          filters={
            _map(taskStatusOptions, status => (
              <li key={status}>
                <label htmlFor={status} className="mr-flex mr-items-center">
                  <input
                    id={status}
                    className="mr-checkbox-toggle mr-mr-2"
                    type="checkbox"
                    checked={this.props.includeTaskStatuses[status]}
                    onChange={(e) =>
                      this.props.toggleIncludedTaskStatus(status, e.nativeEvent.shiftKey)
                    } />
                  <FormattedMessage {...messagesByStatus[status]} />
                </label>
              </li>
            ))
          }
        />
      </div>
    )
  }
}
