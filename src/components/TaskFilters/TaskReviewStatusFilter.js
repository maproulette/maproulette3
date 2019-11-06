import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import FilterDropdown from './FilterDropdown'
import _map from 'lodash/map'
import { TaskReviewStatusWithUnset,
        messagesByReviewStatus }
      from '../../services/Task/TaskReview/TaskReviewStatus'
import messages from './Messages'


/**
 * TaskReviewStatusFilter builds a dropdown for searching by task review status
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskReviewStatusFilter extends Component {
  render() {
    return (
      <FilterDropdown
        title={<FormattedMessage {...messages.filterByReviewStatusLabel} />}
        filters={
          _map(TaskReviewStatusWithUnset, status => (
            <li key={status}>
              <label className="mr-flex mr-items-center">
                <input className="mr-mr-2"
                  type="checkbox"
                  checked={this.props.includeTaskReviewStatuses[status]}
                  onChange={() => this.props.toggleIncludedTaskReviewStatus(status)} />
                <FormattedMessage {...messagesByReviewStatus[status]} />
              </label>
            </li>
          ))
        }
      />
    )
  }
}
