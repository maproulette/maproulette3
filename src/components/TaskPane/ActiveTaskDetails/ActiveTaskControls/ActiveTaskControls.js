import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { get as _get } from 'lodash'
import { isCompleted } from '../../../../services/Task/TaskStatus/TaskStatus'
import WithMapBoundsState from '../../../HOCs/WithMapBounds/WithMapBoundsState'
import WithKeyboardShortcuts from '../../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import TaskEditControls from './TaskEditControls/TaskEditControls'
import TaskCompletionControls from './TaskCompletionControls/TaskCompletionControls'
import TaskDoneControls from './TaskDoneControls/TaskDoneControls'

/**
 * ActiveTaskControls renders the appropriate controls for the given
 * active task based on the state of the task and editing workflow.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ActiveTaskControls extends Component {
  state = {
    taskBeingCompleted: null,
  }

  setTaskBeingCompleted = (taskId) => {
    this.setState({taskBeingCompleted: taskId})
  }

  render() {
    if (!this.props.task) {
      return null
    }

    const isEditingTask =
      _get(this.props, 'editor.taskId') === this.props.task.id &&
      _get(this.props, 'editor.success') === true

    if (isCompleted(_get(this.props, 'task.status'))) {
      return <TaskDoneControls {...this.props} />
    }
    else if (isEditingTask) {
      // Editor is open, show completion options
      return <TaskCompletionControls setTaskBeingCompleted={this.setTaskBeingCompleted}
                                     {...this.props} />
    }
    else if (_get(this.props, 'editor.taskId') !== this.props.task.id &&
             this.state.taskBeingCompleted === this.props.task.id) {
      // Busy spinner until editor catches up with us
      return <BusySpinner />
    }
    else {
      return <TaskEditControls setTaskBeingCompleted={this.setTaskBeingCompleted}
                               {...this.props} />
    }
  }
}

ActiveTaskControls.propTypes = {
  task: PropTypes.object,
  editor: PropTypes.object,
}

ActiveTaskControls.defaultProps = {
  editor: {},
}

export default WithMapBoundsState(
  WithKeyboardShortcuts(
    injectIntl(ActiveTaskControls)
  )
)
