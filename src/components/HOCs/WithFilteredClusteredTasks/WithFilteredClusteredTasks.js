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
import _find from 'lodash/find'
import _isEqual from 'lodash/isEqual'
import _isFinite from 'lodash/isFinite'
import _each from 'lodash/each'
import _merge from 'lodash/merge'
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
      selectedTasks: new Map(),
      filteredTasks: {tasks: []},
    })


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
                                             this.state.includePriorities,
                                             this.state.includeLocked)

      const allFilteredTasks = this.filterTasks(includeStatuses,
                                             this.state.includeReviewStatuses,
                                             this.state.includePriorities,
                                             this.state.includeLocked, true)
      const selectedTasks = this.unselectExcludedTasks(allFilteredTasks)

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
                                             this.state.includePriorities,
                                             this.state.includeLocked)

      const allFilteredTasks = this.filterTasks(this.state.includeStatuses,
                                             includeReviewStatuses,
                                             this.state.includePriorities,
                                             this.state.includeLocked, true)
      const selectedTasks = this.unselectExcludedTasks(allFilteredTasks)

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
                                             includePriorities,
                                             this.state.includeLocked)

      const allFilteredTasks = this.filterTasks(this.state.includeStatuses,
                                             this.state.includeReviewStatuses,
                                             includePriorities,
                                             this.state.includeLocked, true)
      const selectedTasks = this.unselectExcludedTasks(allFilteredTasks)
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
    filterTasks = (includeStatuses, includeReviewStatuses, includePriorities, includeLocked,
                   includeAll = false) => {
      let results = null
      let tasks = _get(this.props[tasksProp], 'tasks')
      if (_isArray(tasks)) {
        if (includeAll) {
          // In order to include all, we need to include any that are in the
          // selectedTasks that were not in props[tasksProps]
          // (props[taskProps] is limited to only current page of results)
          tasks = _merge(tasks, Array.from(this.state.selectedTasks.values()))
        }

        results = Object.assign({}, this.props[tasksProp], {
          tasks: _filter(tasks, task =>
            includeStatuses[task.status] && includePriorities[task.priority] &&
            ((_isUndefined(task.reviewStatus) && includeReviewStatuses[REVIEW_STATUS_NOT_SET]) ||
              includeReviewStatuses[task.reviewStatus]) &&
            (includeLocked || !_isFinite(task.lockedBy) || task.lockedBy === _get(this.props, 'user.id'))
          ),
        })
      }

      return results
    }

    /**
     * Toggle selection of the given task on or off
     */
    toggleTaskSelection = task => {
      const selected = new Map(this.state.selectedTasks)
      if (selected.has(task.id)) {
        selected.delete(task.id)
      }
      else {
        selected.set(task.id, task)
      }

      this.setState({selectedTasks: selected})
    }

    /**
     * Toggle selection of the task with the given id on or off. Requires a
     * search of the tasks, so less optimal than toggleTaskSelection
     */
    toggleTaskSelectionById = taskId => {
      const selected = new Map(this.state.selectedTasks)
      if (selected.has(taskId)) {
        selected.delete(taskId)
      }
      else {
        const task = _find(_get(this.props[tasksProp], 'tasks', []), {id: taskId})
        if (task) {
          selected.set(task.id, task)
        }
      }

      this.setState({selectedTasks: selected})
    }

    /**
     * Select multiple tasks matching the given task ids
     */
    selectTasksById = (taskIds, allTasks) => {
      if (_isEmpty(taskIds)) {
        return
      }

      const selected = new Map(this.state.selectedTasks)
      const tasks = _filter(allTasks,
                            task => taskIds.indexOf(task.id) !== -1)

      _each(tasks, task => selected.set(task.id, task))
      this.setState({selectedTasks: selected})
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
      const selected = new Map(this.state.selectedTasks)
      const excludedTasks = _differenceBy([...selected.values()],
                                          filteredTasks.tasks,
                                          task => task.id)

      for (let i = 0; i < excludedTasks.length; i++) {
        selected.delete(excludedTasks[i].id)
      }

      return selected
    }

    /**
     * Refresh the selected tasks to ensure they don't include tasks that don't
     * pass the current filters. This is intended for wrapped components to use
     * if they do something that alters the status of tasks.
     */
    refreshSelectedTasks = () => {
      const filteredTasks = this.filterTasks(this.state.includeStatuses,
                                             this.state.includeReviewStatuses,
                                             this.state.includePriorities,
                                             this.state.includeLocked)

      const allfilteredTasks = this.filterTasks(this.state.includeStatuses,
                                                this.state.includeReviewStatuses,
                                                this.state.includePriorities,
                                                this.state.includeLocked,
                                                true)
      const selectedTasks = this.unselectExcludedTasks(allfilteredTasks)
      this.setState({filteredTasks, selectedTasks})
    }

    /**
     * Toggle selection of all the tasks on or off. If not all tasks are
     * currently selected, then all will be selected; if all were selected then
     * all will be unselected.
     */
    toggleAllTasksSelection = () => {
      const selected = new Map(this.state.selectedTasks)
      if (this.allTasksAreSelected()) {
        selected.clear()
      }
      else {
        let task = null

        selected.clear()
        for (let i = 0; i < this.state.filteredTasks.tasks.length; i++) {
          task = this.state.filteredTasks.tasks[i]
          selected.set(task.id, task)
        }
      }

      this.setState({selectedTasks: selected})
    }

    /**
     * All will be unselected.
     */
    unselectAllTasks = () => {
      const selected = new Map(this.state.selectedTasks)
      selected.clear()
      this.setState({selectedTasks: selected})
    }

    /**
     * Select all filtered tasks that match the given status.
     */
    selectTasksWithStatus = status => {
      const selected = new Map(this.state.selectedTasks)
      let task = null

      for (let i = 0; i < this.state.filteredTasks.tasks.length; i++) {
        task = this.state.filteredTasks.tasks[i]
        if (task.status === status) {
          selected.set(task.id, task)
        }
      }

      this.setState({selectedTasks: selected})
    }

    /**
     * Select all filtered tasks that match the given status.
     */
    selectTasksWithPriority = priority => {
      const selected = new Map(this.state.selectedTasks)
      let task = null

      for (let i = 0; i < this.state.filteredTasks.tasks.length; i++) {
        task = this.state.filteredTasks.tasks[i]
        if (task.priority === priority) {
          selected.set(task.id, task)
        }
      }

      this.setState({selectedTasks: selected})
    }

    /**
     * Select the given tasks. No checks are made to ensure the tasks are
     * actually included in the filtered results, so take care with this method
     */
    selectTasks = tasks => {
      const selected = new Map(this.state.selectedTasks)
      for (let i = 0; i < tasks.length; i++) {
        selected.set(tasks[i].id, tasks[i])
      }

      this.setState({selectedTasks: selected})
    }

    clearAllFilters = () => {
      const freshFilters = this.defaultFilters()
      const filteredTasks = this.filterTasks(freshFilters.includeStatuses,
                                             freshFilters.includeReviewStatuses,
                                             freshFilters.includePriorities,
                                             freshFilters.includeLocked)

      const allFilteredTasks = this.filterTasks(freshFilters.includeStatuses,
                                             freshFilters.includeReviewStatuses,
                                             freshFilters.includePriorities,
                                             freshFilters.includeLocked, true)
      const selectedTasks = this.unselectExcludedTasks(allFilteredTasks)

      this.setState(Object.assign({filteredTasks, selectedTasks}, freshFilters))
    }

    resetSelectedTasks = () => {
      this.clearAllFilters()
      this.setState({selectedTasks: new Map()})
    }

    componentDidMount() {
      const filteredTasks = this.filterTasks(this.state.includeStatuses,
                                             this.state.includeReviewStatuses,
                                             this.state.includePriorities,
                                             this.state.includeLocked)
      this.setState({filteredTasks})

      // If we have a property that wants the accessor to unselect all tasks
      // then set it up.
      if (this.props.setResetSelectedTasksAccessor) {
        this.props.setResetSelectedTasksAccessor(() => this.resetSelectedTasks())
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (!_isEqual(_get(prevProps[tasksProp], 'tasks'), _get(this.props[tasksProp], 'tasks')) ||
          _get(prevProps[tasksProp], 'fetchId') !== _get(this.props[tasksProp], 'fetchId')) {
        this.refreshSelectedTasks()
      }

      if (!_isEqual(this.state.selectedTasks, prevState.selectedTasks)) {
        // If we have a listener for selected tasks let's pass up our changed tasks
        if (this.props.setSelectedTasks) {
          this.props.setSelectedTasks(this.state.selectedTasks)
        }
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
                               toggleTaskSelectionById={this.toggleTaskSelectionById}
                               toggleAllTasksSelection={this.toggleAllTasksSelection}
                               refreshSelectedTasks={this.refreshSelectedTasks}
                               selectTasksWithStatus={this.selectTasksWithStatus}
                               selectTasksWithPriority={this.selectTasksWithPriority}
                               selectTasks={this.selectTasks}
                               selectTasksById={this.selectTasksById}
                               allTasksAreSelected={this.allTasksAreSelected}
                               someTasksAreSelected={this.someTasksAreSelected}
                               clearAllFilters={this.clearAllFilters}
                               resetSelectedTasks={this.resetSelectedTasks}
                               {..._omit(this.props, outputProp)} />
    }
  }
}
