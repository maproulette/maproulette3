import React, { Component } from 'react'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import _fromPairs from 'lodash/fromPairs'
import _isEmpty from 'lodash/isEmpty'
import _isArray from 'lodash/isArray'
import _differenceBy from 'lodash/differenceBy'
import _omit from 'lodash/omit'
import _isUndefined from 'lodash/isUndefined'
import { TaskStatus, keysByStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatusWithUnset, keysByReviewStatus }
      from '../../../../services/Task/TaskReview/TaskReviewStatus'
import { TaskPriority, keysByPriority }
       from '../../../../services/Task/TaskPriority/TaskPriority'

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
                                                   outputProp) {
  return class extends Component {
    state = {
      includeStatuses: _fromPairs(_map(TaskStatus, status => [status, true])),
      includeReviewStatuses: _fromPairs(_map(TaskReviewStatusWithUnset, status => [status, true])),
      includePriorities: _fromPairs(_map(TaskPriority, priority => [priority, true])),
      selectedTasks: new Map(),
      filteredTasks: {tasks: []},
    }

    /**
     * Toggle filtering on or off for the given task status
     */
    toggleIncludedStatus = status => {
      const includeStatuses = Object.assign(
        {},
        this.state.includeStatuses,
        {[status]: !this.state.includeStatuses[status]}
      )

      const filteredTasks = this.filterTasks(includeStatuses,
                                             this.state.includeReviewStatuses,
                                             this.state.includePriorities)
      const selectedTasks = this.unselectExcludedTasks(filteredTasks)

      this.setState({
        includeStatuses,
        selectedTasks,
        filteredTasks,
      })
    }

    /**
     * Toggle filtering on or off for the given task review status
     */
    toggleIncludedReviewStatus = status => {
      const includeReviewStatuses = Object.assign(
        {},
        this.state.includeReviewStatuses,
        {[status]: !this.state.includeReviewStatuses[status]}
      )

      const filteredTasks = this.filterTasks(this.state.includeStatuses,
                                             includeReviewStatuses,
                                             this.state.includePriorities)
      const selectedTasks = this.unselectExcludedTasks(filteredTasks)

      this.setState({
        includeReviewStatuses,
        selectedTasks,
        filteredTasks,
      })
    }

    /**
     * Toggle filtering on or off for the given task priority
     */
    toggleIncludedPriority = priority => {
      const includePriorities = Object.assign(
        {},
        this.state.includePriorities,
        {[priority]: !this.state.includePriorities[priority]}
      )

      const filteredTasks = this.filterTasks(this.state.includeStatuses,
                                             this.state.includeReviewStatuses,
                                             includePriorities)
      const selectedTasks = this.unselectExcludedTasks(filteredTasks)
      this.setState({
        includePriorities,
        selectedTasks,
        filteredTasks,
      })
    }

    /**
     * Filters the tasks, returning only those that match both the given
     * statuses and priorites.
     */
    filterTasks = (includeStatuses, includeReviewStatuses, includePriorities) => {
      let results = null
      if (_isArray(_get(this.props[tasksProp], 'tasks'))) {
        results = Object.assign({}, this.props[tasksProp], {
          tasks: _filter(this.props[tasksProp].tasks, task =>
            includeStatuses[task.status] && includePriorities[task.priority] &&
            ((_isUndefined(task.reviewStatus) && includeReviewStatuses[-1]) ||
              includeReviewStatuses[task.reviewStatus])
          ),
        })
      }

      return results
    }

    /**
     * Toggle selection of the given task on or off
     */
    toggleTaskSelection = task => {
      if (this.state.selectedTasks.has(task.id)) {
        this.state.selectedTasks.delete(task.id)
      }
      else {
        this.state.selectedTasks.set(task.id, task)
      }

      this.setState({selectedTasks: new Map(this.state.selectedTasks)})
    }

    /**
     * Returns true if all tasks are selected, false if not. This method
     * simply compares the number of selected tasks and doesn't actually
     * check each task individually.
     */
    allTasksAreSelected = () => {
      if (this.state.selectedTasks.size === 0) {
        return false
      }

      return this.state.selectedTasks.size ===
             _get(this.state, 'filteredTasks.tasks.length', 0)
    }

    /**
     * Returns true if some, but not all, tasks are selected.
     */
    someTasksAreSelected = () => {
      return this.state.selectedTasks.size > 0 && !this.allTasksAreSelected()
    }

    /**
     * Removes from the currently selected tasks any tasks that are no longer
     * present in the given filtered tasks.
     *
     * @private
     */
    unselectExcludedTasks = filteredTasks => {
      const excludedTasks = _differenceBy([...this.state.selectedTasks.values()],
                                          filteredTasks.tasks,
                                          task => task.id)

      for (let i = 0; i < excludedTasks.length; i++) {
        this.state.selectedTasks.delete(excludedTasks[i].id)
      }

      return this.state.selectedTasks
    }

    /**
     * Refresh the selected tasks to ensure they don't include tasks that don't
     * pass the current filters. This is intended for wrapped components to use
     * if they do something that alters the status of tasks.
     */
    refreshSelectedTasks = () => {
      const filteredTasks = this.filterTasks(this.state.includeStatuses,
                                             this.state.includeReviewStatuses,
                                             this.state.includePriorities)
      const selectedTasks = this.unselectExcludedTasks(filteredTasks)
      this.setState({filteredTasks, selectedTasks})
    }

    /**
     * Toggle selection of all the tasks on or off. If not all tasks are
     * currently selected, then all will be selected; if all were selected then
     * all will be unselected.
     */
    toggleAllTasksSelection = () => {
      if (this.allTasksAreSelected()) {
        this.state.selectedTasks.clear()
      }
      else {
        let task = null

        this.state.selectedTasks.clear()
        for (let i = 0; i < this.state.filteredTasks.tasks.length; i++) {
          task = this.state.filteredTasks.tasks[i]
          this.state.selectedTasks.set(task.id, task)
        }
      }

      this.setState({selectedTasks: new Map(this.state.selectedTasks)})
    }

    /**
     * Select all filtered tasks that match the given status.
     */
    selectTasksWithStatus = status => {
      let task = null

      for (let i = 0; i < this.state.filteredTasks.tasks.length; i++) {
        task = this.state.filteredTasks.tasks[i]
        if (task.status === status) {
          this.state.selectedTasks.set(task.id, task)
        }
      }

      this.setState({selectedTasks: new Map(this.state.selectedTasks)})
    }

    /**
     * Select all filtered tasks that match the given status.
     */
    selectTasksWithPriority = priority => {
      let task = null

      for (let i = 0; i < this.state.filteredTasks.tasks.length; i++) {
        task = this.state.filteredTasks.tasks[i]
        if (task.priority === priority) {
          this.state.selectedTasks.set(task.id, task)
        }
      }

      this.setState({selectedTasks: new Map(this.state.selectedTasks)})
    }

    clearAllFilters = () => {
      const filteredTasks = this.filterTasks(keysByStatus, keysByReviewStatus, keysByPriority)
      const selectedTasks = this.unselectExcludedTasks(filteredTasks)

      this.setState({filteredTasks, selectedTasks,
                     includeStatuses: _fromPairs(_map(TaskStatus, status => [status, true])),
                     includeReviewStatuses: _fromPairs(_map(TaskReviewStatusWithUnset, status => [status, true])),
                     includePriorities: _fromPairs(_map(TaskPriority, priority => [priority, true])), })
    }

    componentDidMount() {
      const filteredTasks = this.filterTasks(this.state.includeStatuses,
                                             this.state.includeReviewStatuses,
                                             this.state.includePriorities)
      this.setState({filteredTasks})
    }

    componentDidUpdate(prevProps) {
      if (_get(prevProps[tasksProp], 'tasks.length', 0) !==
          _get(this.props[tasksProp], 'tasks.length', 0)) {
        this.setState({
          filteredTasks: this.filterTasks(this.state.includeStatuses,
                                          this.state.includeReviewStatuses,
                                          this.state.includePriorities)
        })
      }
    }

    render() {
      if (_isEmpty(outputProp)) {
        outputProp = tasksProp
      }

      return <WrappedComponent {...{[outputProp]: this.state.filteredTasks}}
                               includeTaskStatuses={this.state.includeStatuses}
                               includeTaskReviewStatuses={this.state.includeReviewStatuses}
                               includeTaskPriorities={this.state.includePriorities}
                               selectedTasks={this.state.selectedTasks}
                               toggleIncludedTaskStatus={this.toggleIncludedStatus}
                               toggleIncludedTaskReviewStatus={this.toggleIncludedReviewStatus}
                               toggleIncludedTaskPriority={this.toggleIncludedPriority}
                               toggleTaskSelection={this.toggleTaskSelection}
                               toggleAllTasksSelection={this.toggleAllTasksSelection}
                               refreshSelectedTasks={this.refreshSelectedTasks}
                               selectTasksWithStatus={this.selectTasksWithStatus}
                               selectTasksWithPriority={this.selectTasksWithPriority}
                               allTasksAreSelected={this.allTasksAreSelected}
                               someTasksAreSelected={this.someTasksAreSelected}
                               clearAllFilters={this.clearAllFilters}
                               {..._omit(this.props, outputProp)} />
    }
  }
}
