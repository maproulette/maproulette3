import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import MediaQuery from 'react-responsive'
import _get from 'lodash/get'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../services/Widget/Widget'
import WithWidgetWorkspaces
       from '../HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import AsManager from '../../interactions/User/AsManager'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithChallengePreferences
       from '../HOCs/WithChallengePreferences/WithChallengePreferences'
import WidgetWorkspace from '../WidgetWorkspace/WidgetWorkspace'
import WithSuggestedFix from '../HOCs/WithSuggestedFix/WithSuggestedFix'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import TaskMap from './TaskMap/TaskMap'
import VirtualChallengeNameLink
       from '../VirtualChallengeNameLink/VirtualChallengeNameLink'
import ChallengeNameLink from '../ChallengeNameLink/ChallengeNameLink'
import OwnerContactLink from '../ChallengeOwnerContactLink/ChallengeOwnerContactLink'
import BusySpinner from '../BusySpinner/BusySpinner'
import MobileTaskDetails from './MobileTaskDetails/MobileTaskDetails'
import messages from './Messages'
import './TaskPane.scss'

// Setup child components with necessary HOCs
const MobileTabBar = WithCurrentUser(MobileTaskDetails)

const WIDGET_WORKSPACE_NAME = "taskCompletion"

export const defaultWorkspaceSetup = function() {
  return {
    dataModelVersion: 2,
    name: WIDGET_WORKSPACE_NAME,
    label: "Task Completion",
    widgets: [
      widgetDescriptor('TaskInstructionsWidget'),
      widgetDescriptor('TaskMapWidget'),
      widgetDescriptor('TaskCompletionWidget'),
      widgetDescriptor('TaskLocationWidget'),
    ],
    layout: [
      {i: generateWidgetId(), x: 0, y: 0, w: 4, h: 4},
      {i: generateWidgetId(), x: 4, y: 0, w: 8, h: 19},
      {i: generateWidgetId(), x: 0, y: 4, w: 4, h: 7},
      {i: generateWidgetId(), x: 0, y: 11, w: 4, h: 8},
    ],
    excludeWidgets: [
      'TaskReviewWidget',
    ]
  }
}

/**
 * TaskPane presents the current task being actively worked upon. It contains
 * an WidgetWorkspace with information and controls, including a TaskMap
 * displaying the appropriate map and task geometries.
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
  completeTask = (task, challengeId, taskStatus, comment, tags, taskLoadBy, userId,
                  needsReview, requestedNextTask, osmComment) => {
    this.setState({completingTask: task.id})
    this.props.completeTask(task, challengeId, taskStatus, comment, tags, taskLoadBy, userId,
                            needsReview, requestedNextTask, osmComment)
  }

  clearCompletingTask = () => {
    // Clear on next tick to give our animation transition a chance to clean up.
    setTimeout(() => {
      this.setState({completingTask: null})
    }, 0)
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname &&
        this.props.location.search !== prevProps.location.search) {
      window.scrollTo(0, 0)
    }
  }

  render() {
    if (!_get(this.props, 'task.parent.parent')) {
      return (
        <div className="pane-loading full-screen-height">
          <BusySpinner />
        </div>
      )
    }

    const taskInspectRoute =
      `/admin/project/${this.props.task.parent.parent.id}/` +
      `challenge/${this.props.task.parent.id}/task/${this.props.task.id}/inspect`

    const isManageable =
      AsManager(this.props.user).canManageChallenge(_get(this.props, 'task.parent'))

    return (
      <div className='task-pane'>
        <MediaQuery query="(min-width: 1024px)">
          <WidgetWorkspace
            {...this.props}
            className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-py-8 mr-cards-inverse"
            workspaceEyebrow={<VirtualChallengeNameLink {...this.props} />}
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

                {isManageable && !this.props.inspectTask && (
                  <li>
                    <button className="mr-transition mr-text-current hover:mr-text-green-lighter" onClick={() => this.props.history.push(taskInspectRoute)}>
                      <FormattedMessage {...messages.inspectLabel} />
                    </button>
                  </li>
                )}
              </ul>
            }
            completeTask={this.completeTask}
            completingTask={this.state.completingTask}
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

TaskPane.propTypes = {
  /** The task to be worked upon. */
  task: PropTypes.object,
}

export default
WithChallengePreferences(
  WithWidgetWorkspaces(
    WithSuggestedFix(
      injectIntl(TaskPane)
    ),
    WidgetDataTarget.task,
    WIDGET_WORKSPACE_NAME,
    defaultWorkspaceSetup
  )
)
