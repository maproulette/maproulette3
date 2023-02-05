import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import {
  generateWidgetId,
  WidgetDataTarget,
  widgetDescriptor,
} from '../../services/Widget/Widget'
import WithChallengePreferences from '../HOCs/WithChallengePreferences/WithChallengePreferences'
import WithCooperativeWork from '../HOCs/WithCooperativeWork/WithCooperativeWork'
import WithTaskBundle from '../HOCs/WithTaskBundle/WithTaskBundle'
import WithLockedTask from '../HOCs/WithLockedTask/WithLockedTask'
import BusySpinner from '../BusySpinner/BusySpinner'
import WithPublicWidgetWorkspaces from '../HOCs/WithPublicWidgetWorkspaces/WithPublicWidgetWorkspaces'
import { PublicWidgetGrid } from '../PublicWidgetGrid/PublicWidgetGrid'
import ChallengeNameLink from '../ChallengeNameLink/ChallengeNameLink'
import SignInButton from '../SignInButton/SignInButton'
import { Redirect } from 'react-router'

const WIDGET_WORKSPACE_NAME = 'taskCompletion'

// How frequently the task lock should be refreshed
const LOCK_REFRESH_INTERVAL = 600000 // 10 minutes

export const defaultWorkspaceSetup = function () {
  return {
    dataModelVersion: 2,
    name: WIDGET_WORKSPACE_NAME,
    label: 'Task Completion',
    widgets: [
      widgetDescriptor('ChallengeShareWidget'),
      widgetDescriptor('TaskStatusWidget'),
      widgetDescriptor('OSMHistoryWidget'),
      // widgetDescriptor('TaskHistoryWidget') // problem
      widgetDescriptor('PublicTaskInstructionsWidget'),
      // widgetDescriptor('TaskMapWidget'),
    ],
    layout: [
      { i: generateWidgetId(), x: 10, y: 8, w: 2, h: 3 },
      { i: generateWidgetId(), x: 8, y: 8, w: 2, h: 3 },
      { i: generateWidgetId(), x: 4, y: 6, w: 4, h: 6 },
      // {i: generateWidgetId(), x: 4, y: 0, w: 4, h: 6},
      { i: generateWidgetId(), x: 0, y: 0, w: 4, h: 11 },
      // {i: generateWidgetId(), x: 8, y: 0, w: 4, h: 8},
    ],
  }
}

/**
 * PublicTaskPane presents the preview page of current task. It contains
 * an WidgetWorkspace with information and controls, including
 * task instruction, challenge share control, task completion progress, task status
 * OSM history, task history, and a task map
 *
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
    workspaceContext: {},
  }

  tryLockingTask = () => {
    this.props.tryLocking(this.props.task).then((success) => {
      this.setState({ showLockFailureDialog: !success })
    })
  }

  clearLockFailure = () => {
    this.setState({ showLockFailureDialog: false })
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

  setWorkspaceContext = (updatedContext) => {
    this.setState({
      workspaceContext: Object.assign(
        {},
        this.state.workspaceContext,
        updatedContext
      ),
    })
  }

  componentDidMount() {
    // Setup an interval to refresh the task lock every so often so that it
    // doesn't expire while the mapper is actively working on the task
    // this.clearLockRefreshInterval()
    // this.lockRefreshInterval = setInterval(() => {
    //   this.props.refreshTaskLock(this.props.task).then(success => {
    //     if (!success) {
    //       this.setState({showLockFailureDialog: true})
    //     }
    //   })
    // }, LOCK_REFRESH_INTERVAL)
  }

  componentWillUnmount() {
    this.clearLockRefreshInterval()
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location.pathname !== prevProps.location.pathname &&
  //       this.props.location.search !== prevProps.location.search) {
  //     window.scrollTo(0, 0)
  //   }

  //   if (this.props.taskReadOnly && !prevProps.taskReadOnly) {
  //     this.setState({showLockFailureDialog: true})
  //   }
  // }

  render() {
    const loggedIn = localStorage.getItem('isLoggedIn')
    if (loggedIn) {
      <Redirect
        to={`/challenge/${this.props.challengeId}/task/${this.props.task.id}`}
      />
    }

    if (!_get(this.props, 'task.parent.parent')) {
      return (
        <div className='pane-loading full-screen-height'>
          <BusySpinner />
        </div>
      )
    }

    return (
      <div className='mr-bg-gradient-r-green-dark-blue'>
        <h2 className='mr-text-xl mr-pl-4 mr-pt-4 mr-links-inverse'>
          <ChallengeNameLink {...this.props} includeProject suppressShareLink />
        </h2>
        <div className='mr-text-white mr-pb-8 mr-cards-inverse'>
          <PublicWidgetGrid
            {...this.props}
            workspace={this.props.currentConfiguration}
            workspaceContext={this.state.workspaceContext}
            setWorkspaceContext={this.setWorkspaceContext}
          />
          {!loggedIn && (
            <div className='mr-pl-4'>
              <SignInButton {...this.props} longForm className='' />
            </div>
          )}
        </div>
      </div>
    )
  }
}

PublicTaskPane.propTypes = {
  /** The task to be worked upon. */
  task: PropTypes.object,
}

export default WithChallengePreferences(
  WithPublicWidgetWorkspaces(
    WithTaskBundle(
      WithCooperativeWork(WithLockedTask(injectIntl(PublicTaskPane)))
    ),
    WidgetDataTarget.task,
    WIDGET_WORKSPACE_NAME,
    defaultWorkspaceSetup
  )
)
