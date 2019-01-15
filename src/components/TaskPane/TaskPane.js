import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MediaQuery from 'react-responsive'
import _isFinite from 'lodash/isFinite'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import TaskMap from './TaskMap/TaskMap'
import BusySpinner from '../BusySpinner/BusySpinner'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithEditor from '../HOCs/WithEditor/WithEditor'
import WithChallengePreferences
       from '../HOCs/WithChallengePreferences/WithChallengePreferences'
import ActiveTaskDetails from './ActiveTaskDetails/ActiveTaskDetails'
import MobileTaskDetails from './MobileTaskDetails/MobileTaskDetails'
import './TaskPane.scss'

// Setup child components with necessary HOCs
const TaskDetailsSidebar = WithCurrentUser(WithEditor(ActiveTaskDetails))
const MobileTabBar = WithCurrentUser(MobileTaskDetails)

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
export class TaskPane extends Component {
  state = {
    /**
     * id of task once user initiates completion. This is used to help our
     * animation transitions.
     */
    completingTask: null,
  }

  /**
   * Invoked by various completion controls to signal the user is completing
   * the task with a specific status. Normally this would just go straight to
   * WithCurrentTask, but we intercept the call so that we can manage our
   * transition animation as the task prepares to complete.
   */
  completeTask = (taskId, challengeId, taskStatus, comment, taskLoadBy) => {
    this.setState({completingTask: taskId})
    this.props.completeTask(taskId, challengeId, taskStatus, comment, taskLoadBy)
  }

  clearCompletingTask = () => {
    // Clear on next tick to give our animation transition a chance to clean up.
    setTimeout(() => {
      this.setState({completingTask: null})
    }, 0)
  }

  render() {
    if (!_isFinite(_get(this.props, 'task.id'))) {
      return (
        <div className="pane-loading full-screen-height">
          <BusySpinner />
        </div>
      )
    }

    return (
      <div className='task-pane'>
        <MediaQuery query="(min-width: 1024px)">
          <TaskDetailsSidebar task={this.props.task}
                              completeTask={this.completeTask}
                              {..._omit(this.props, 'completeTask')} />
        </MediaQuery>
        <MapPane completingTask={this.state.completingTask}>
          <TaskMap task={this.props.task}
                   challenge={this.props.task.parent}
                   {...this.props} />
        </MapPane>
        <MediaQuery query="(max-width: 1023px)">
          <MobileTabBar {...this.props} />
        </MediaQuery>
      </div>
    )
  }
}

TaskPane.propTypes = {
  /** The task to be worked upon. */
  task: PropTypes.object,
}

export default WithChallengePreferences(TaskPane)
