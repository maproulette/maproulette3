import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import TaskMap from './TaskMap/TaskMap'
import BusySpinner from '../BusySpinner/BusySpinner'
import WithTaskCenterPoint from '../HOCs/WithTaskCenterPoint/WithTaskCenterPoint'
import WithMapBoundsDispatch from '../HOCs/WithMapBounds/WithMapBoundsDispatch'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithEditor from '../HOCs/WithEditor/WithEditor'
import ActiveTaskDetails from './ActiveTaskDetails/ActiveTaskDetails'
import './TaskPane.css'

// Setup child components with necessary HOCs
const TaskDetailsSidebar = WithCurrentUser(WithEditor(ActiveTaskDetails))
const DetailMap = WithMapBoundsDispatch(WithTaskCenterPoint(TaskMap))

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
  render() {
    if (!this.props.task) {
      return <BusySpinner />
    }

    return (
      <div className='task-pane'>
        <TaskDetailsSidebar task={this.props.task} {...this.props} />
        <MapPane>
          <DetailMap task={this.props.task} {...this.props} />
        </MapPane>
      </div>
    )
  }
}

TaskPane.propTypes = {
  /** The task to be worked upon. */
  task: PropTypes.object,
}
