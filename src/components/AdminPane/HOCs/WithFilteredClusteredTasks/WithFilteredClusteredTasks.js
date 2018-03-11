import React, { Component } from 'react'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import _fromPairs from 'lodash/fromPairs'
import _isEmpty from 'lodash/isEmpty'
import _isArray from 'lodash/isArray'
import _omit from 'lodash/omit'
import { TaskStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { TaskPriority }
       from '../../../../services/Task/TaskPriority/TaskPriority'

/**
 * WithFilteredClusteredTasks applies local filters to the given clustered
 * tasks, along with a `toggleIncludedTaskStatus` function for toggling filtering
 * on and off for a given status. The filter settings for each task status are
 * passed down in the `includeTaskStatuses` props. By default, all statuses are
 * enabled (so tasks in any status will pass through).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default function WithFilteredClusteredTasks(WrappedComponent,
                                                   tasksProp='clusteredTasks',
                                                   outputProp) {
  return class extends Component {
    state = {
      includeStatuses: _fromPairs(_map(TaskStatus, status => [status, true])),
      includePriorities: _fromPairs(_map(TaskPriority, priority => [priority, true])),
    }

    /**
     * Toggle filtering on or off for the given task status
     */
    toggleIncludedStatus = status => {
      this.setState({includeStatuses: Object.assign(
        {},
        this.state.includeStatuses,
        {[status]: !this.state.includeStatuses[status]})
      })
    }

    /**
     * Toggle filtering on or off for the given task priority
     */
    toggleIncludedPriority = priority => {
      this.setState({includePriorities: Object.assign(
        {},
        this.state.includePriorities,
        {[priority]: !this.state.includePriorities[priority]})
      })
    }

    render() {
      let filteredTasks = null
      if (_isArray(_get(this.props[tasksProp], 'tasks'))) {
        filteredTasks = Object.assign({}, this.props[tasksProp], {
          tasks: _filter(this.props[tasksProp].tasks, task =>
            this.state.includeStatuses[task.status] &&
            this.state.includePriorities[task.priority]
          ),
        })
      }

      if (_isEmpty(outputProp)) {
        outputProp = tasksProp
      }

      return <WrappedComponent {...{[outputProp]: filteredTasks}}
                               includeTaskStatuses={this.state.includeStatuses}
                               includeTaskPriorities={this.state.includePriorities}
                               toggleIncludedTaskStatus={this.toggleIncludedStatus}
                               toggleIncludedTaskPriority={this.toggleIncludedPriority}
                               {..._omit(this.props, outputProp)} />
    }
  }
}
