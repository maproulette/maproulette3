import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MediaQuery from 'react-responsive'
import _isFinite from 'lodash/isFinite'
import _get from 'lodash/get'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../services/Widget/Widget'
import WithWidgetWorkspaces
       from '../HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithChallengePreferences
       from '../HOCs/WithChallengePreferences/WithChallengePreferences'
import WidgetWorkspace from '../WidgetWorkspace/WidgetWorkspace'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import TaskMap from '../TaskPane/TaskMap/TaskMap'
import ChallengeNameLink from '../ChallengeNameLink/ChallengeNameLink'
import OwnerContactLink from '../ChallengeOwnerContactLink/ChallengeOwnerContactLink'
import BusySpinner from '../BusySpinner/BusySpinner'
import MobileTaskDetails from '../TaskPane/MobileTaskDetails/MobileTaskDetails'
import './ReviewTaskPane.scss'

// Setup child components with necessary HOCs
const MobileTabBar = WithCurrentUser(MobileTaskDetails)

const WIDGET_WORKSPACE_NAME = "taskReview"

export const defaultWorkspaceSetup = function() {
  return {
    dataModelVersion: 2,
    name: WIDGET_WORKSPACE_NAME,
    label: "Task Review",
    widgets: [
      widgetDescriptor('TaskStatusWidget'),
      widgetDescriptor('TaskInstructionsWidget'),
      widgetDescriptor('TaskMapWidget'),
      widgetDescriptor('TaskReviewWidget'),
      widgetDescriptor('TaskCommentsWidget'),
    ],
    layout: [
      {i: generateWidgetId(), x: 0, y: 0, w: 4, h: 3},
      {i: generateWidgetId(), x: 0, y: 3, w: 4, h: 4},
      {i: generateWidgetId(), x: 4, y: 0, w: 8, h: 18},
      {i: generateWidgetId(), x: 0, y: 7, w: 4, h: 8},
      {i: generateWidgetId(), x: 0, y: 15, w: 4, h: 6},
    ],
  }
}

/**
 * ReviewTaskPane presents the current task being actively worked upon. It contains
 * an WidgetWorkspace with information and controls, including a TaskMap
 * displaying the appropriate map and task geometries.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ReviewTaskPane extends Component {
  state = {
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname &&
        this.props.location.search !== prevProps.location.search) {
      window.scrollTo(0, 0)
    }
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
          <WidgetWorkspace
            {...this.props}
            className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-py-8 mr-cards-inverse"
            workspaceEyebrow={<ChallengeNameLink {...this.props} />}
            workspaceTitle={
              <h1 className="mr-h2 mr-my-2 mr-links-inverse">
                <ChallengeNameLink {...this.props} />
              </h1>
            }
            workspaceInfo={
              <ul className="mr-list-ruled mr-text-xs">
                <li className="mr-links-inverse">
                  {_get(this.props.task, 'parent.parent.displayName')}
                </li>

                <li className="mr-links-green-lighter">
                  <OwnerContactLink {...this.props} />
                </li>
              </ul>
            }
        />
        </MediaQuery>
        <MediaQuery query="(max-width: 1023px)">
          <MapPane completingTask={this.state.completingTask}>
            <TaskMap isMobile
                     task={this.props.task}
                     challenge={this.props.task.parent}
                     {...this.props} />
          </MapPane>
          <MobileTabBar {...this.props} />
        </MediaQuery>
      </div>
    )
  }
}

ReviewTaskPane.propTypes = {
  /** The task to be worked upon. */
  task: PropTypes.object,
}

export default
WithChallengePreferences(
  WithWidgetWorkspaces(
    ReviewTaskPane,
    WidgetDataTarget.task,
    WIDGET_WORKSPACE_NAME,
    defaultWorkspaceSetup
  )
)
