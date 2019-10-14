import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import FilterDropdown from './FilterDropdown'
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
    return (
      <FilterDropdown
        title={<FormattedMessage {...messages.filterByStatusLabel} />}
        filters={
          _map(_keys(this.props.includeTaskStatuses), status => (
            <li key={status}>
              <label className="mr-flex mr-items-center">
                <input className="mr-mr-2"
                  type="checkbox"
                  checked={this.props.includeTaskStatuses[status]}
                  onChange={() => this.props.toggleIncludedTaskStatus(status)} />
                <FormattedMessage {...messagesByStatus[status]} />
              </label>
            </li>
          ))
        }
      />
    )
  }
}
