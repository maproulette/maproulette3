import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import MediaQuery from 'react-responsive'
import { Link } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import classNames from 'classnames'
import _get from 'lodash/get'
import _findIndex from 'lodash/findIndex'
import _isFinite from 'lodash/isFinite'
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
import ChallengeNameLink from '../ChallengeNameLink/ChallengeNameLink'
import OwnerContactLink, { JoinChallengeDiscussionLink } from '../ChallengeOwnerContactLink/ChallengeOwnerContactLink'
import BasicDialog from '../BasicDialog/BasicDialog'
import Dropdown from '../Dropdown/Dropdown'
import BusySpinner from '../BusySpinner/BusySpinner'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import MobileTaskDetails from './MobileTaskDetails/MobileTaskDetails'
import messages from './Messages'

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
                            needsReview, requestedNextTask, osmComment, tagEdits,
                            this.state.completionResponses, taskBundle).then(() => {
      this.clearCompletingTask()
    })
    this.props.clearActiveTaskBundle()
  }

  clearCompletingTask = () => {
    // Clear on next tick to give our animation transition a chance to clean up.
    setTimeout(() => {
      this.setState({completingTask: null})
    }, 0)
  }

  setCompletionResponse = (propertyName, value) => {
    const responses =
      this.state.completionResponses ?
      Object.assign({}, this.state.completionResponses) :
      JSON.parse(_get(this.props, 'task.completionResponses', '{}'))

    responses[propertyName] = value
    this.setState({completionResponses: responses})
  }

  setNeedsResponses = (needsResponses) => {
    if (needsResponses !== this.state.needsResponses) {
      this.setState({needsResponses})
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

    // Setup favorite/unfavorite links
    const challenge = this.props.task.parent
    let favoriteControl = null
    if (!challenge.isVirtual) {
      const isFavorited = _findIndex(this.props.user.savedChallenges, {id: challenge.id}) !== -1
      favoriteControl = (
        <li>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            className="mr-normal-case mr-flex"
            onClick={() => (isFavorited ? this.props.unsaveChallenge : this.props.saveChallenge)(
              this.props.user.id,
              challenge.id
            )}
          >
            <div className="mr-text-white mr-w-4">
              {isFavorited && "✓"}
            </div>
            <FormattedMessage {...messages.favoriteLabel} />
          </a>
        </li>
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

                {this.props.tryingLock ? <BusySpinner inline className="mr-mr-4" /> : (
                 <Dropdown
                   className="mr-dropdown--right"
                   dropdownButton={dropdown => (
                     <button
                       onClick={dropdown.toggleDropdownVisible}
                       className="mr-flex mr-items-center mr-text-green-lighter mr-mr-4"
                     >
                       {this.props.taskReadOnly ?
                        <SvgSymbol
                          sym="unlocked-icon"
                          viewBox="0 0 60 60"
                          className="mr-w-6 mr-h-6 mr-fill-pink-light"
                        /> :
                        <SvgSymbol
                          sym="locked-icon"
                          viewBox="0 0 20 20"
                          className="mr-w-4 mr-h-4 mr-fill-current"
                        />
                       }
                     </button>
                   )}
                   dropdownContent={(dropdown) => (
                     this.props.taskReadOnly ? (
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
                       </div>
                     ) : (
                       <div className="mr-links-green-lighter mr-text-sm mr-flex mr-items-center mr-mt-2">
                         <span className="mr-flex mr-items-baseline">
                           <FormattedMessage {...messages.taskLockedLabel} />
                         </span>
                         <Link
                           to={
                             _isFinite(this.props.virtualChallengeId) ?
                             `/browse/virtual/${this.props.virtualChallengeId}` :
                             `/browse/challenges/${_get(this.props.task, 'parent.id', this.props.task.parent)}`
                           }
                           className="mr-button mr-button--xsmall mr-ml-3"
                         >
                           <FormattedMessage {...messages.taskUnlockLabel} />
                         </Link>
                       </div>
                     )
                   )}
                 />
                )}

                <Dropdown
                  className="mr-dropdown--right"
                  dropdownButton={dropdown => (
                    <button
                      onClick={dropdown.toggleDropdownVisible}
                      className="mr-flex mr-items-center mr-text-green-lighter"
                    >
                      <SvgSymbol
                        sym="navigation-more-icon"
                        viewBox="0 0 20 20"
                        className="mr-fill-current mr-w-4 mr-h-4"
                      />
                    </button>
                  )}
                  dropdownContent={(dropdown) => (
                    <React.Fragment>
                      <ul className="mr-list-dropdown">
                        {favoriteControl}
                      </ul>
                      <hr className="mr-rule-dropdown" />
                      <ul className="mr-list-dropdown">
                        {_isFinite(this.props.virtualChallengeId) &&
                          <li>
                            <CopyToClipboard
                              text={`${process.env.REACT_APP_URL}/browse/virtual/${this.props.virtualChallengeId}`}
                              onCopy={() => dropdown.closeDropdown()}
                            >
                              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                              <a>
                                <FormattedMessage {...messages.copyVirtualShareLinkLabel} />
                              </a>
                            </CopyToClipboard>
                          </li>
                        }
                        <li>
                          <CopyToClipboard
                            text={`${process.env.REACT_APP_URL}/browse/challenges/${challenge.id}`}
                            onCopy={() => dropdown.closeDropdown()}
                          >
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a>
                              <FormattedMessage {...messages.copyShareLinkLabel} />
                            </a>
                          </CopyToClipboard>
                        </li>

                        <li className="mr-mt-n1px">
                          <OwnerContactLink {...this.props} />
                        </li>

                        <li className="mr-links-green-lighter">
                          <JoinChallengeDiscussionLink {...this.props} />
                        </li>
                      </ul>

                      {isManageable && !this.props.inspectTask && (
                        <React.Fragment>
                          <hr className="mr-rule-dropdown" />
                          <ul className="mr-list-dropdown">
                            <li>
                              <button
                                className="mr-transition mr-text-green-lighter hover:mr-text-current"
                                onClick={() => this.props.history.push(taskInspectRoute)}
                              >
                                <FormattedMessage {...messages.inspectLabel} />
                              </button>
                            </li>
                          </ul>
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  )}
                />
              </div>
            }
            completeTask={this.completeTask}
            completingTask={this.state.completingTask}
            setCompletionResponse={this.setCompletionResponse}
            setNeedsResponses={this.setNeedsResponses}
            completionResponses={completionResponses}
            needsResponses={this.state.needsResponses}
            templateRevision={isCompletionStatus(this.props.task.status)}
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
