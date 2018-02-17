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

export default function WithFilteredClusteredTasks(WrappedComponent,
                                                   tasksProp='clusteredTasks',
                                                   outputProp) {
  return class extends Component {
    state = {
      includeStatuses: _fromPairs(_map(TaskStatus, status => [status, true])),
    }

    toggleIncludedStatus = status => {
      this.setState({includeStatuses: Object.assign(
        {},
        this.state.includeStatuses,
        {[status]: !this.state.includeStatuses[status]})
      })
    }

    render() {
      let filteredTasks = null
      if (_isArray(_get(this.props[tasksProp], 'tasks'))) {
        filteredTasks = Object.assign(
          {},
          this.props[tasksProp],
          {
            tasks: _filter(this.props[tasksProp].tasks,
                           task => this.state.includeStatuses[task.status])
          }
        )
      }

      if (_isEmpty(outputProp)) {
        outputProp = tasksProp
      }

      return <WrappedComponent {...{[outputProp]: filteredTasks}}
                               includeStatuses={this.state.includeStatuses}
                               toggleIncludedStatus={this.toggleIncludedStatus}
                               {..._omit(this.props, outputProp)} />
    }
  }
}
