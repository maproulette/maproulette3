import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import MediaQuery from 'react-responsive'
import classNames from 'classnames'
import _get from 'lodash/get'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../services/Widget/Widget'
import WithWidgetWorkspaces
       from '../HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithChallengePreferences
       from '../HOCs/WithChallengePreferences/WithChallengePreferences'
import WidgetWorkspace from '../WidgetWorkspace/WidgetWorkspace'
import WithCooperativeWork from '../HOCs/WithCooperativeWork/WithCooperativeWork'
import WithTaskBundle from '../HOCs/WithTaskBundle/WithTaskBundle'
import WithLockedTask from '../HOCs/WithLockedTask/WithLockedTask'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import TaskMap from './TaskMap/TaskMap'
import ChallengeNameLink from '../ChallengeNameLink/ChallengeNameLink'
import BasicDialog from '../BasicDialog/BasicDialog'
import BusySpinner from '../BusySpinner/BusySpinner'
import MobileTaskDetails from './MobileTaskDetails/MobileTaskDetails'
import messages from './Messages'
import WithPublicWidgetWorkspaces from '../HOCs/WithPublicWidgetWorkspaces/WithPublicWidgetWorkspaces'

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
    ],
    layout: [
      {i: generateWidgetId(), x: 0, y: 0, w: 4, h: 4},
      {i: generateWidgetId(), x: 4, y: 0, w: 8, h: 5},
      {i: generateWidgetId(), x: 4, y: 5, w: 8, h: 19},
      {i: generateWidgetId(), x: 0, y: 4, w: 4, h: 7},
    ],
    permanentWidgets: [ // Cannot be removed from workspace
    ],
    excludeWidgets: [ // Cannot be added to workspace
      'TaskReviewWidget',
    ],
    conditionalWidgets: [ // conditionally displayed
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
export class PublicTaskPane extends Component {
  lockRefreshInterval = null

  state = {
    /**
     * id of task once user initiates completion. This is used to help our
     * animation transitions.
     */
    completingTask: null,
    completionResponses: null,
    showLockFailureDialog: false,
    needsResponses: false,
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

    if (this.props.taskReadOnly && !prevProps.taskReadOnly) {
      this.setState({showLockFailureDialog: true})
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

    return (
      <div className="mr-relative">
        <MediaQuery query="(min-width: 1024px)">
          <WidgetWorkspace
            {...this.props}
            className={classNames(
              "mr-bg-gradient-r-green-dark-blue mr-text-white mr-pb-8 mr-cards-inverse", {
              "mr-pt-2": !this.props.inspectTask,
              }
            )}
            workspaceTitle={
              <div className="mr-flex mr-items-baseline mr-mt-4">
                <h2 className="mr-text-xl mr-my-0 mr-mr-2 mr-links-inverse">
                  <ChallengeNameLink {...this.props} includeProject suppressShareLink />
                </h2>
              </div>
            }
            hideLayoutButton={true}
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
        {this.state.showLockFailureDialog &&
         <BasicDialog
           title={<FormattedMessage {...messages.lockFailedTitle} />}
            prompt={
              <React.Fragment>
                <span>
                  {_get(
                    this.props,
                    'lockFailureDetails.message',
                    this.props.intl.formatMessage(messages.genericLockFailure)
                  )}
                </span>
                <FormattedMessage {...messages.previewAvailable} />
              </React.Fragment>
            }
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

PublicTaskPane.propTypes = {
  /** The task to be worked upon. */
  task: PropTypes.object,
}

export default
WithChallengePreferences(
  WithPublicWidgetWorkspaces(
    WithTaskBundle(
      WithCooperativeWork(
        WithLockedTask(
          injectIntl(PublicTaskPane)
        )
      ),
    ),
    WidgetDataTarget.task,
    WIDGET_WORKSPACE_NAME,
    defaultWorkspaceSetup
  )
)
