import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import MediaQuery from 'react-responsive'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../services/Widget/Widget'
import { isCompletionStatus }
       from '../../services/Task/TaskStatus/TaskStatus'
import WithWidgetWorkspaces
       from '../HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import AsManager from '../../interactions/User/AsManager'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithChallengePreferences
       from '../HOCs/WithChallengePreferences/WithChallengePreferences'
import WidgetWorkspace from '../WidgetWorkspace/WidgetWorkspace'
import WithCooperativeWork from '../HOCs/WithCooperativeWork/WithCooperativeWork'
import WithTaskBundle from '../HOCs/WithTaskBundle/WithTaskBundle'
import WithLockedTask from '../HOCs/WithLockedTask/WithLockedTask'
import SignIn from '../../pages/SignIn/SignIn'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import TaskMap from './TaskMap/TaskMap'
import VirtualChallengeNameLink
       from '../VirtualChallengeNameLink/VirtualChallengeNameLink'
import ChallengeNameLink from '../ChallengeNameLink/ChallengeNameLink'
import OwnerContactLink from '../ChallengeOwnerContactLink/ChallengeOwnerContactLink'
import BasicDialog from '../BasicDialog/BasicDialog'
import BusySpinner from '../BusySpinner/BusySpinner'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import MobileTaskDetails from './MobileTaskDetails/MobileTaskDetails'
import messages from './Messages'
import './TaskPane.scss'

// Setup child components with necessary HOCs
const MobileTabBar = WithCurrentUser(MobileTaskDetails)

const WIDGET_WORKSPACE_NAME = "taskCompletion"

// How frequently the task lock should be refreshed
const LOCK_REFRESH_INTERVAL = 600000 // 10 minutes

export const defaultWorkspaceSetup = function() {
  return {
    dataModelVersion: 2,
    name: WIDGET_WORKSPACE_NAME,
    label: "Task Completion",
    widgets: [
      widgetDescriptor('TaskInstructionsWidget'),
      widgetDescriptor('TagDiffWidget'),
      widgetDescriptor('TaskMapWidget'),
      widgetDescriptor('TaskCompletionWidget'),
      widgetDescriptor('TaskLocationWidget'),
    ],
    layout: [
      {i: generateWidgetId(), x: 0, y: 0, w: 4, h: 4},
      {i: generateWidgetId(), x: 4, y: 0, w: 8, h: 5},
      {i: generateWidgetId(), x: 4, y: 5, w: 8, h: 19},
      {i: generateWidgetId(), x: 0, y: 4, w: 4, h: 7},
      {i: generateWidgetId(), x: 0, y: 11, w: 4, h: 8},
    ],
    permanentWidgets: [ // Cannot be removed from workspace
      'TaskMapWidget',
      'TaskCompletionWidget',
      'TagDiffWidget',
    ],
    excludeWidgets: [ // Cannot be added to workspace
      'TaskReviewWidget',
    ],
    conditionalWidgets: [ // conditionally displayed
      'TagDiffWidget',
    ],
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
  lockRefreshInterval = null

  state = {
    /**
     * id of task once user initiates completion. This is used to help our
     * animation transitions.
     */
    completingTask: null,
    completionResponses: null,
    showLockFailureDialog: false,
  }

  tryLockingTask = () => {
    this.props.tryLocking(this.props.task).then(success => {
      this.setState({showLockFailureDialog: !success})
    })
  }

  clearLockFailure = () => {
    this.setState({showLockFailureDialog: false})
  }

  /**
   * Clear the lock-refresh timer if one is set
   */
  clearLockRefreshInterval = () => {
    if (this.lockRefreshInterval !== null) {
      clearInterval(this.lockRefreshInterval)
      this.lockRefreshInterval = null
    }
  }

  /**
   * Invoked by various completion controls to signal the user is completing
   * the task with a specific status. Normally this would just go straight to
   * WithCurrentTask, but we intercept the call so that we can manage our
   * transition animation as the task prepares to complete.
   */
  completeTask = (task, challengeId, taskStatus, comment, tags, taskLoadBy, userId,
                  needsReview, requestedNextTask, osmComment, tagEdits, taskBundle) => {
    this.setState({completingTask: task.id})
    this.props.completeTask(task, challengeId, taskStatus, comment, tags, taskLoadBy, userId,
                            needsReview, requestedNextTask, osmComment, tagEdits, this.state.completionResponses, taskBundle)
    this.props.clearActiveTaskBundle()
  }

  clearCompletingTask = () => {
    // Clear on next tick to give our animation transition a chance to clean up.
    setTimeout(() => {
      this.setState({completingTask: null})
    }, 0)
  }

  setCompletionResponse = (propertyName, value) => {
    const responses = this.state.completionResponses ||
      JSON.parse(_get(this.props, 'task.completionResponses', null)) || {}
    responses[propertyName] = value
    this.setState({completionResponses: responses})
  }

  componentDidMount() {
    // Setup an interval to refresh the task lock every so often so that it
    // doesn't expire while the mapper is actively working on the task
    this.clearLockRefreshInterval()
    this.lockRefreshInterval = setInterval(() => {
      this.props.refreshTaskLock(this.props.task).then(success => {
        if (!success) {
          this.setState({showLockFailureDialog: true})
        }
      })
    }, LOCK_REFRESH_INTERVAL)
  }

  componentWillUnmount() {
    this.clearLockRefreshInterval()
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname &&
        this.props.location.search !== prevProps.location.search) {
      window.scrollTo(0, 0)
    }

    if (_get(this.props, 'task.id') !== _get(prevProps, 'task.id')) {
      this.setState({completionResponses: null})
    }

    if (this.props.taskReadOnly && !prevProps.taskReadOnly) {
      this.setState({showLockFailureDialog: true})
    }
  }

  render() {
    if (!this.props.user) {
      return (
        this.props.checkingLoginStatus ?
        <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
          <BusySpinner />
        </div> :
        <SignIn {...this.props} />
      )
    }

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

    const completionResponses = this.state.completionResponses ||
                                JSON.parse(_get(this.props, 'task.completionResponses', null)) || {}

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
              <React.Fragment>
                <div>
                  <ul className="mr-list-ruled mr-text-xs mr-links-green-lighter">
                    <li>
                      <Link to={`/browse/projects/${_get(this.props.task, 'parent.parent.id')}`}>
                        {_get(this.props.task, 'parent.parent.displayName')}
                      </Link>
                    </li>

                    <li>
                      <OwnerContactLink {...this.props} />
                    </li>

                    {isManageable && !this.props.inspectTask && (
                      <li>
                        <button
                          className="mr-transition mr-text-green-lighter hover:mr-text-current"
                          onClick={() => this.props.history.push(taskInspectRoute)}
                        >
                          <FormattedMessage {...messages.inspectLabel} />
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
                {this.props.tryingLock ? <BusySpinner inline /> : (
                 this.props.taskReadOnly ?
                 <div className="mr-links-green-lighter mr-text-sm mr-flex mr-items-center mr-mt-2">
                   <span className="mr-flex mr-items-baseline mr-text-pink-light">
                     <FormattedMessage {...messages.taskReadOnlyLabel} />
                   </span>
                   <button
                     type="button"
                     className="mr-button mr-button--xsmall mr-ml-3"
                     onClick={() => this.tryLockingTask()}
                   >
                     <FormattedMessage {...messages.taskTryLockLabel} />
                   </button>
                 </div> :

                 <div className="mr-links-green-lighter mr-text-sm mr-flex mr-items-center mr-mt-2">
                   <SvgSymbol
                     sym="locked-icon"
                     viewBox="0 0 20 20"
                     className="mr-fill-current mr-w-4 mr-h-4 mr-mr-1"
                   />
                   <span className="mr-flex mr-items-baseline">
                     <FormattedMessage {...messages.taskLockedLabel} />
                   </span>
                   <Link
                     to={`/browse/challenges/${_get(this.props.task, 'parent.id', this.props.task.parent)}`}
                     className="mr-button mr-button--xsmall mr-ml-3"
                   >
                     <FormattedMessage {...messages.taskUnlockLabel} />
                   </Link>
                 </div>
                )}
              </React.Fragment>
            }
            completeTask={this.completeTask}
            completingTask={this.state.completingTask}
            setCompletionResponse={this.setCompletionResponse}
            completionResponses={completionResponses}
            disableTemplate={isCompletionStatus(this.props.task.status)}
          />
          {this.state.completingTask && this.state.completingTask === this.props.task.id &&
           <div
             className="mr-fixed mr-top-0 mr-bottom-0 mr-left-0 mr-right-0 mr-z-200 mr-bg-blue-firefly-75 mr-flex mr-justify-center mr-items-center"
           >
             <BusySpinner big inline />
           </div>
          }
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
        {this.state.showLockFailureDialog &&
         <BasicDialog
           title={<FormattedMessage {...messages.lockFailedTitle} />}
           prompt={<FormattedMessage {...messages.lockFailedPrompt} />}
           icon="unlocked-icon"
           onClose={() => this.clearLockFailure()}
           controls = {
             <React.Fragment>
               <button
                 className="mr-button mr-button--green-light mr-mr-4"
                 onClick={() => this.clearLockFailure()}
               >
                 <FormattedMessage {...messages.previewTaskLabel} />
               </button>
               {this.props.tryingLock ?
                <div className="mr-mr-4"><BusySpinner inline /></div> :
                <button
                  className="mr-button mr-button--green-light mr-mr-4"
                  onClick={() => this.tryLockingTask()}
                >
                  <FormattedMessage {...messages.retryLockLabel} />
                </button>
               }
               <button
                 className="mr-button mr-button--white"
                 onClick={() => {
                   this.props.history.push(`/browse/challenges/${_get(this.props.task, 'parent.id', this.props.task.parent)}`)
                 }}
               >
                 <FormattedMessage {...messages.browseChallengeLabel} />
               </button>
             </React.Fragment>
           }
         />
        }
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
    WithTaskBundle(
      WithCooperativeWork(
        WithLockedTask(
          injectIntl(TaskPane)
        )
      ),
    ),
    WidgetDataTarget.task,
    WIDGET_WORKSPACE_NAME,
    defaultWorkspaceSetup
  )
)
