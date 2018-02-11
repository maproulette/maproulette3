import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import _isNumber from 'lodash/isNumber'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import TaskMap from './TaskMap/TaskMap'
import BusySpinner from '../BusySpinner/BusySpinner'
import WithTaskCenterPoint from '../HOCs/WithTaskCenterPoint/WithTaskCenterPoint'
import WithMapBounds from '../HOCs/WithMapBounds/WithMapBounds'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithEditor from '../HOCs/WithEditor/WithEditor'
import ActiveTaskDetails from './ActiveTaskDetails/ActiveTaskDetails'
import './TaskPane.css'

// Setup child components with necessary HOCs
const TaskDetailsSidebar = WithCurrentUser(WithEditor(ActiveTaskDetails))
const DetailMap = WithMapBounds(WithTaskCenterPoint(TaskMap))

/**
 * TaskPane presents the current task being actively worked upon. It contains
 * an ActiveTaskDetails sidebar, which offers information and controls, and a
 * TaskMap displaying the appropriate map and task geometries.
 *
 * @see See ActiveTaskDetails
 * @see See TaskMap
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskPane extends Component {
  state = {
    /**
     * id of task once user initiates completion. This is used to help our
     * animation transitions.
     */
    completingTask: null,
  }

  completeTask = (taskId, challengeId, taskStatus, comment) => {
    // Record that we're completing the task so that our animation transition
    // can begin.
    this.setState({completingTask: taskId})
    this.props.completeTask(taskId, challengeId, taskStatus, comment)
  }

  componentWillReceiveProps(nextProps) {
    // reset completingTask state if we're starting on a new task.
    if (this.state.completingTask !== null &&
        _get(nextProps, 'task.id') !== this.state.completingTask) {
      this.setState({completingTask: null})
    }
  }

  render() {
    if (!_isNumber(_get(this.props, 'task.id'))) {
      return <BusySpinner />
    }

    return (
      <div className='task-pane'>
        <TaskDetailsSidebar task={this.props.task}
                            completeTask={this.completeTask}
                            {..._omit(this.props, 'completeTask')} />
        <MapPane>
          <TransitionGroup>
            {this.state.completingTask !== this.props.task.id &&
              <CSSTransition key={this.props.task.id} timeout={1500}
                             classNames="animate-slide">
                <DetailMap task={this.props.task} {...this.props} />
              </CSSTransition>
            }
          </TransitionGroup>
        </MapPane>
      </div>
    )
  }
}

TaskPane.propTypes = {
  /** The task to be worked upon. */
  task: PropTypes.object,
}
