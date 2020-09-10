import React, { Component } from 'react'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import _fromPairs from 'lodash/fromPairs'
import _isEmpty from 'lodash/isEmpty'
import _isArray from 'lodash/isArray'
import _omit from 'lodash/omit'
import _isUndefined from 'lodash/isUndefined'
import _isEqual from 'lodash/isEqual'
import _isFinite from 'lodash/isFinite'
import _cloneDeep from 'lodash/cloneDeep'
import _assignWith from 'lodash/assignWith'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatusWithUnset, REVIEW_STATUS_NOT_SET }
      from '../../../services/Task/TaskReview/TaskReviewStatus'
import { TaskPriority } from '../../../services/Task/TaskPriority/TaskPriority'

/**
 * WithFilteredClusteredTasks applies local filters to the given clustered
 * tasks, along with a `toggleIncludedTaskStatus` and `toggleIncludedPriority`
 * functions for toggling filtering on and off for a given status or priority,
 * and a 'toggleTaskSelection' for toggling whether a specific task should be
 * considered as selected. The filter and selection settings for are passed
 * down in the `includeTaskStatuses`, `includeTaskPriorities`, and
 * `selectedTasks` props. By default, all statuses and priorities are enabled
 * (so tasks in any status and priority will pass through) and no tasks are
 * selected.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default function WithFilteredClusteredTasks(WrappedComponent,
                                                   tasksProp='clusteredTasks',
                                                   outputProp,
                                                   initialFilters) {
  return class extends Component {
    defaultFilters = () => {
      return {
        includeStatuses: _get(initialFilters, 'statuses',
                              _fromPairs(_map(TaskStatus, status => [status, true]))),
        includeReviewStatuses: _get(initialFilters, 'reviewStatuses',
                                    _fromPairs(_map(TaskReviewStatusWithUnset, status => [status, true]))),
        includePriorities: _get(initialFilters, 'priorities',
                                _fromPairs(_map(TaskPriority, priority => [priority, true]))),
        includeLocked: _get(initialFilters, 'includeLocked', true),
      }
    }

    state = Object.assign({}, this.defaultFilters(), {
      filteredTasks: {tasks: []},
    })

    /**
     * Toggle filtering on or off for the given task status
     */
    toggleIncludedStatus = (status, exclusiveSelect = false) => {
      const includeStatuses = exclusiveSelect ?
        _assignWith(
          {},
          this.state.includeStatuses,
          (objValue, srcValue, key) => key === status.toString()
        ) :
        Object.assign(
          {},
          this.state.includeStatuses,
          {[status]: !this.state.includeStatuses[status]}
        )

      const filteredTasks = this.filterTasks(includeStatuses,
                                             this.state.includeReviewStatuses,
                                             this.state.includePriorities,
                                             this.state.includeLocked)
      this.setState({includeStatuses, filteredTasks})

      // If task selection is active, prune any selections that no longer pass filters
      this.props.pruneSelectedTasks && this.props.pruneSelectedTasks(task =>
        !this.taskPassesFilters(
          task,
          includeStatuses,
          this.state.includeReviewStatuses,
          this.state.includePriorities,
          this.state.includeLocked
        )
      )
    }

    /**
     * Toggle filtering on or off for the given task review status
     */
    toggleIncludedReviewStatus = (status, exclusiveSelect = false) => {
      const includeReviewStatuses = exclusiveSelect ?
        _assignWith(
          {},
          this.state.includeReviewStatuses,
          (objValue, srcValue, key) => key === status.toString()
        ) :
        Object.assign(
          {},
          this.state.includeReviewStatuses,
          {[status]: !this.state.includeReviewStatuses[status]}
        )

      const filteredTasks = this.filterTasks(this.state.includeStatuses,
                                             includeReviewStatuses,
                                             this.state.includePriorities,
                                             this.state.includeLocked)

      this.setState({includeReviewStatuses, filteredTasks})

      // If task selection is active, prune any selections that no longer pass filters
      this.props.pruneSelectedTasks && this.props.pruneSelectedTasks(task =>
        !this.taskPassesFilters(
          task,
          this.state.includeStatuses,
          includeReviewStatuses,
          this.state.includePriorities,
          this.state.includeLocked
        )
      )
    }

    /**
     * Toggle filtering on or off for the given task priority
     */
    toggleIncludedPriority = (priority, exclusiveSelect) => {
      const includePriorities = exclusiveSelect ?
        _assignWith(
          {},
          this.state.includePriorities,
          (objValue, srcValue, key) => key === priority.toString()
        ) :
        Object.assign(
          {},
          this.state.includePriorities,
          {[priority]: !this.state.includePriorities[priority]}
        )

      const filteredTasks = this.filterTasks(this.state.includeStatuses,
                                             this.state.includeReviewStatuses,
                                             includePriorities,
                                             this.state.includeLocked)

      this.setState({includePriorities, filteredTasks})

      // If task selection is active, prune any selections that no longer pass filters
      this.props.pruneSelectedTasks && this.props.pruneSelectedTasks(task =>
        !this.taskPassesFilters(
          task,
          this.state.includeStatuses,
          this.state.includeReviewStatuses,
          includePriorities,
          this.state.includeLocked
        )
      )
    }

    /**
     * Filters the tasks, returning only those that match both the given
     * statuses and priorites.
     */
    filterTasks = (includeStatuses, includeReviewStatuses, includePriorities, includeLocked) => {
      let results = {tasks: []}
      let tasks = _cloneDeep(_get(this.props[tasksProp], 'tasks'))
      if (_isArray(tasks)) {
        results = Object.assign({}, this.props[tasksProp], {
          tasks: _filter(tasks, task =>
            this.taskPassesFilters(task, includeStatuses, includeReviewStatuses, includePriorities, includeLocked)
          )
        })
      }

      return results
    }

    /**
     * Determines if the given task passes all active filters, returning true if it does
     */
    taskPassesFilters = (task, includeStatuses, includeReviewStatuses, includePriorities, includeLocked) => {
      return (
        includeStatuses[task.status] && includePriorities[task.priority] &&
        ((_isUndefined(task.reviewStatus) && includeReviewStatuses[REVIEW_STATUS_NOT_SET]) ||
          includeReviewStatuses[task.reviewStatus]) &&
        (includeLocked || !_isFinite(task.lockedBy) || task.lockedBy === _get(this.props, 'user.id'))
      )
    }

    clearAllFilters = () => {
      const freshFilters = this.defaultFilters()
      const filteredTasks = this.filterTasks(freshFilters.includeStatuses,
                                             freshFilters.includeReviewStatuses,
                                             freshFilters.includePriorities,
                                             freshFilters.includeLocked)

      this.setState(Object.assign({filteredTasks}, freshFilters))

      // Reset any task selections as well
      this.props.resetSelectedTasks && this.props.resetSelectedTasks()
    }

    /**
     * Refresh the currently filtered tasks, intended to be used after task
     * statuses or other filterable criteria have been changed
     */
    refreshFilteredTasks = () => {
      const filteredTasks = this.filterTasks(this.state.includeStatuses,
                                             this.state.includeReviewStatuses,
                                             this.state.includePriorities,
                                             this.state.includeLocked)

      this.setState({filteredTasks})

      // If task selection is active, prune any selections that no longer pass filters
      this.props.pruneSelectedTasks && this.props.pruneSelectedTasks(task =>
        !this.taskPassesFilters(
          task,
          this.state.includeStatuses,
          this.state.includeReviewStatuses,
          this.state.includePriorities,
          this.state.includeLocked
        )
      )
    }

    componentDidMount() {
      const filteredTasks = this.filterTasks(this.state.includeStatuses,
                                             this.state.includeReviewStatuses,
                                             this.state.includePriorities,
                                             this.state.includeLocked)
      this.setState({filteredTasks})
    }

    componentDidUpdate(prevProps, prevState) {
      if (!_isEqual(_get(prevProps[tasksProp], 'tasks'), _get(this.props[tasksProp], 'tasks')) ||
          _get(prevProps[tasksProp], 'fetchId') !== _get(this.props[tasksProp], 'fetchId')) {
        this.refreshFilteredTasks()
      }
    }

    render() {
      if (_isEmpty(outputProp)) {
        outputProp = tasksProp
      }

      return <WrappedComponent
        {...{[outputProp]: this.state.filteredTasks}}
        includeTaskStatuses={this.state.includeStatuses}
        includeTaskReviewStatuses={this.state.includeReviewStatuses}
        includeTaskPriorities={this.state.includePriorities}
        toggleIncludedTaskStatus={this.toggleIncludedStatus}
        toggleIncludedTaskReviewStatus={this.toggleIncludedReviewStatus}
        toggleIncludedTaskPriority={this.toggleIncludedPriority}
        clearAllFilters={this.clearAllFilters}
        {..._omit(this.props, outputProp)}
      />
    }
  }
}
