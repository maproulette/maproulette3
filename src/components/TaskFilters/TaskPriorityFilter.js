import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import FilterDropdown from './FilterDropdown'
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
    return (
      <FilterDropdown
        title={<FormattedMessage {...messages.filterByPriorityLabel} />}
        filters={
          _reverse(_map(TaskPriority, priority => (
            <li key={priority}>
              <label className="mr-flex mr-items-center">
                <input className="mr-mr-2"
                  type="checkbox"
                  checked={this.props.includeTaskPriorities[priority]}
                  onChange={() => this.props.toggleIncludedTaskPriority(priority)} />
                <FormattedMessage {...messagesByPriority[priority]} />
              </label>
            </li>
          )))
        }
      />
    )
  }
}
