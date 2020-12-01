import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import FilterDropdown from './FilterDropdown'
import _map from 'lodash/map'
import { TaskReviewStatusWithUnset,
        messagesByReviewStatus,
        TaskMetaReviewStatusWithUnset,
        messagesByMetaReviewStatus }
      from '../../services/Task/TaskReview/TaskReviewStatus'
import messages from './Messages'


/**
 * TaskReviewStatusFilter builds a dropdown for searching by task review status
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskReviewStatusFilter extends Component {
  render() {

    const metaReviewStatusFilter =
      !this.props.metaReviewEnabled ? {} : {
        secondaryFilterLabel: "Meta-Review Statuses",
        secondaryFilters:
          _map(TaskMetaReviewStatusWithUnset, status => (
            <li key={`meta-${status}`}>
              <label className="mr-flex mr-items-center">
                <input
                  className="mr-checkbox-toggle mr-mr-2"
                  type="checkbox"
                  checked={this.props.includeMetaReviewStatuses[status]}
                  onChange={(e) =>
                    this.props.toggleIncludedMetaReviewStatus(status,
                                                              e.nativeEvent.shiftKey)
                  } />
                <FormattedMessage {...messagesByMetaReviewStatus[status]} />
              </label>
            </li>
          ))
        }

    return (
      <FilterDropdown
        title={<FormattedMessage {...messages.filterByReviewStatusLabel} />}
        filters={
          _map(TaskReviewStatusWithUnset, status => (
            <li key={status}>
              <label className="mr-flex mr-items-center">
                <input
                  className="mr-checkbox-toggle mr-mr-2"
                  type="checkbox"
                  checked={this.props.includeTaskReviewStatuses[status]}
                  onChange={(e) =>
                    this.props.toggleIncludedTaskReviewStatus(status,
                                                              e.nativeEvent.shiftKey)
                  } />
                <FormattedMessage {...messagesByReviewStatus[status]} />
              </label>
            </li>
          ))
        }
        {...metaReviewStatusFilter}
      />
    )
  }
}
