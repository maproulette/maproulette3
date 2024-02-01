import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import FilterDropdown from './FilterDropdown'
import TaskFilterIndicator from './TaskFilterIndicator'
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

    const taskReviewStatusFiltersActive = !Object.values(this.props.includeTaskReviewStatuses).every(value => value) || 
      Object.keys(this.props.includeTaskReviewStatuses).length < Object.keys(TaskReviewStatusWithUnset).length

    const currentTaskMetaReviewStatuses = this.props.metaReviewEnabled ? 
      Object.values(this.props.includeMetaReviewStatuses).every(value => value) : 
      false
      
    const taskMetaReviewStatusFiltersActive = this.props.metaReviewEnabled ? 
      Object.keys(this.props.includeMetaReviewStatuses).length < Object.keys(TaskMetaReviewStatusWithUnset).length : 
      false

    const areTaskReviewStatusFiltersActive = this.props.metaReviewEnabled ? 
      (taskReviewStatusFiltersActive || !currentTaskMetaReviewStatuses || taskMetaReviewStatusFiltersActive) : 
      taskReviewStatusFiltersActive

    const metaReviewStatusFilter =
      !this.props.metaReviewEnabled ? {} : {
        secondaryFilterLabel:
          this.props.intl.formatMessage(messages.filterByMetaReviewStatusLabel),
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
      <div className='mr-flex mr-space-x-1 mr-items-center'>
        {areTaskReviewStatusFiltersActive && <TaskFilterIndicator />}
        <FilterDropdown
          title={<FormattedMessage {...messages.filterByReviewStatusLabel} />}
          filters={
            _map(TaskReviewStatusWithUnset, status => (
              <li key={status} className='mr-w-76'>
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
      </div>
    )
  }
}
