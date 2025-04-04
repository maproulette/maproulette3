import { Component } from "react";

/**
 * WithSelectedClusteredTasks handles management of selection of individual
 * tasks, including an option for selecting all tasks even if not all tasks are
 * locally available (with subsequent deselection of individual tasks)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default function WithSelectedClusteredTasks(WrappedComponent) {
  return class extends Component {
    state = {
      allSelected: false, // has user toggled selection of all tasks
      selectedTasks: new Map(), // used when allSelected flag is false
      deselectedTasks: new Map(), // used when allSelected flag is true
    };

    /**
     * Toggle selection of the given task on or off
     */
    toggleTaskSelection = (task) => {
      const taskId = task.id ?? task.taskId;

      // Never deselect the main task if present
      if (taskId === this.props.task?.id && this.isTaskSelected(taskId)) {
        return;
      }

      // If allSelected is false, then we work off the selectedTasks map;
      // otherwise we work off the deselectedTasks map
      if (!this.state.allSelected) {
        const selected = new Map(this.state.selectedTasks);
        selected.has(taskId) ? selected.delete(taskId) : selected.set(taskId, task);
        this.setState({ selectedTasks: selected });
      } else {
        const deselected = new Map(this.state.deselectedTasks);
        deselected.has(taskId) ? deselected.delete(taskId) : deselected.set(taskId, task);
        this.setState({ deselectedTasks: deselected });
      }
    };

    /**
     * Select multiple tasks, matching the given task ids, from the given array
     * of tasks (or single-task clusters)
     */
    selectTasks = (tasks) => {
      if (
        !tasks ||
        tasks.length === 0 ||
        (this.state.allSelected && this.state.deselectedTasks.size === 0)
      ) {
        // Nothing to do
        return;
      }

      // If allSelected is false, we need to add to the selectedTasks map;
      // otherwise we need to remove from the deselectedTasks map
      if (!this.state.allSelected) {
        const selectedTasks = new Map(this.state.selectedTasks);

        for (const task of tasks) {
          selectedTasks.set(task.id, task);
        }

        if (this.props.task?.id) {
          selectedTasks.set(this.props.task.id, this.props.task);
        }

        this.setState({ selectedTasks });
      } else {
        const deselectedTasks = new Map(this.state.deselectedTasks);

        for (const task of tasks) {
          deselectedTasks.delete(task.id);
        }

        // Ensure main task is never in deselected list
        if (this.props.task?.id) {
          deselectedTasks.delete(this.props.task.id);
        }

        this.setState({ deselectedTasks });
      }
    };

    /**
     * Deselect multiple tasks, matching the given task ids, from the given
     * array of tasks (or single-task clusters)
     */
    deselectTasks = (tasks) => {
      if (
        !tasks ||
        tasks.length === 0 ||
        (this.state.allSelected && this.state.deselectedTasks.size === 0)
      ) {
        // Nothing to do
        return;
      }

      // Filter out main task from tasks to deselect
      const tasksToDeselect = tasks.filter((task) => task.id !== this.props.task?.id);

      // If allSelected is true, we need to add to the deselectedTasks map;
      // otherwise we need to remove from the selectedTasks map
      if (this.state.allSelected) {
        const deselectedTasks = new Map(this.state.deselectedTasks);

        for (const task of tasksToDeselect) {
          deselectedTasks.set(task.id, task);
        }

        this.setState({ deselectedTasks });
      } else {
        const selectedTasks = new Map(this.state.selectedTasks);

        for (const task of tasksToDeselect) {
          selectedTasks.delete(task.id);
        }

        // Ensure main task stays selected
        if (this.props.task?.id) {
          selectedTasks.set(this.props.task.id, this.props.task);
        }

        this.setState({ selectedTasks });
      }
    };

    /**
     * Returns true if all tasks are actually selected, false if not. If
     * allSelected is true, that means the deselectedTasks map is empty; if
     * allSelected is false, then that means the selectedTasks map size equals
     * the number of total available tasks
     */
    allTasksAreSelected = (totalTasksAvailable) => {
      if (this.state.allSelected) {
        return this.state.deselectedTasks.size === 0;
      }

      return totalTasksAvailable > 0 && this.state.selectedTasks.size === totalTasksAvailable;
    };

    /**
     * Returns true if the given taskId is actively selected, false if not
     */
    isTaskSelected = (taskId) => {
      return (
        this.state.selectedTasks.has(taskId) ||
        (this.state.allSelected && !this.state.deselectedTasks.has(taskId))
      );
    };

    /**
     * Returns true if some, but not all, tasks are selected
     */
    someTasksAreSelected = (totalTasksAvailable) => {
      if (this.state.allSelected) {
        return this.state.deselectedTasks.size > 0;
      }

      return this.state.selectedTasks.size > 0 && !this.allTasksAreSelected(totalTasksAvailable);
    };

    /**
     * Returns the total number of selected tasks
     */
    selectedTaskCount = (totalTasksAvailable) => {
      if (this.state.allSelected) {
        return totalTasksAvailable - this.state.deselectedTasks.size;
      }

      return this.state.selectedTasks.size;
    };

    /**
     * Toggle selection of all the tasks on or off. If not all tasks are
     * currently selected, then all will be selected; if all were selected then
     * all will be unselected.
     */
    toggleAllTasksSelection = (totalTasksAvailable) => {
      this.setState({
        selectedTasks: new Map(),
        deselectedTasks: new Map(),
        allSelected: !this.allTasksAreSelected(totalTasksAvailable),
      });
    };

    /**
     * Reset task selections, unselecting all tasks
     */
    resetSelectedTasks = () => {
      const selectedTasks = new Map();

      // Keep main task selected if present
      if (this.props.task?.id) {
        selectedTasks.set(this.props.task.id, this.props.task);
      }

      this.setState({
        selectedTasks,
        deselectedTasks: new Map(),
        allSelected: false,
      });
    };

    /**
     * Prune tasks that no longer needed to be tracked from the selectedTasks
     * and deselectedTasks maps. The given filter function will be called with
     * each task and, if it returns truthy, the task will be pruned
     */
    pruneSelectedTasks = (filterFunction) => {
      this.trimMap("selectedTasks", filterFunction);
      this.trimMap("deselectedTasks", filterFunction);
    };

    /**
     * Trims from a named map (present in state) any tasks that pass the given
     * filter function
     *
     * @private
     */
    trimMap = (mapName, filterFunction) => {
      let trimmedMap = null;
      for (let [taskId, task] of this.state[mapName]) {
        if (filterFunction(task)) {
          if (!trimmedMap) {
            trimmedMap = new Map(this.state[mapName]);
          }
          trimmedMap.delete(taskId);
        }
      }

      if (trimmedMap) {
        this.setState({ [mapName]: trimmedMap });
      }
    };

    componentDidMount() {
      // Provide parent with way to reset task selections, if desired
      if (this.props.setResetSelectedTasksAccessor) {
        this.props.setResetSelectedTasksAccessor(() => this.resetSelectedTasks());
      }
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          selectedTasks={Object.freeze({
            allSelected: this.state.allSelected,
            selected: this.state.selectedTasks,
            deselected: this.state.deselectedTasks,
          })}
          selectTasks={this.selectTasks}
          deselectTasks={this.deselectTasks}
          toggleTaskSelection={this.toggleTaskSelection}
          toggleAllTasksSelection={this.toggleAllTasksSelection}
          allTasksAreSelected={this.allTasksAreSelected}
          someTasksAreSelected={this.someTasksAreSelected}
          selectedTaskCount={this.selectedTaskCount}
          isTaskSelected={this.isTaskSelected}
          resetSelectedTasks={this.resetSelectedTasks}
          pruneSelectedTasks={this.pruneSelectedTasks}
        />
      );
    }
  };
}
