import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import FilterDropdown from './FilterDropdown'
import TaskFilterIndicator from './TaskFilterIndicator'
import _map from 'lodash/map'
import _reverse from 'lodash/reverse'
import { TaskPriority, messagesByPriority }
       from '../../services/Task/TaskPriority/TaskPriority'
import messages from './Messages'


/**
 * TaskPriorityFilter builds a dropdown for searching by task priority
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskPriorityFilter extends Component {
  render() {
    const areFiltersActive = !Object.values(this.props.includeTaskPriorities).every(value => value)

    return (
      <div className='mr-flex mr-space-x-1 mr-items-center'>
        {areFiltersActive && <TaskFilterIndicator />}
        <FilterDropdown
          title={<FormattedMessage {...messages.filterByPriorityLabel} />}
          filters={
            _reverse(_map(TaskPriority, priority => (
              <li key={priority}>
                <label className="mr-flex mr-items-center">
                  <input
                    className="mr-checkbox-toggle mr-mr-2"
                    type="checkbox"
                    checked={this.props.includeTaskPriorities[priority]}
                    onChange={(e) =>
                      this.props.toggleIncludedTaskPriority(priority,
                                                            e.nativeEvent.shiftKey)
                    } />
                  <FormattedMessage {...messagesByPriority[priority]} />
                </label>
              </li>
            )))
          }
        />
      </div>
    )
  }
}
