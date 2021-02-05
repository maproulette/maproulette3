import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MediaQuery from 'react-responsive'
import { FormattedMessage } from 'react-intl'
import _isFinite from 'lodash/isFinite'
import _get from 'lodash/get'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../services/Widget/Widget'
import WithWidgetWorkspaces
       from '../HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithChallengePreferences
       from '../HOCs/WithChallengePreferences/WithChallengePreferences'
import WithChallenge from '../HOCs/WithChallenge/WithChallenge'
import WithTaskBundle from '../HOCs/WithTaskBundle/WithTaskBundle'
import WithTaskReview from '../HOCs/WithTaskReview/WithTaskReview'
import WidgetWorkspace from '../WidgetWorkspace/WidgetWorkspace'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import TaskMap from '../TaskPane/TaskMap/TaskMap'
import ChallengeNameLink from '../ChallengeNameLink/ChallengeNameLink'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'
import MobileTaskDetails from '../TaskPane/MobileTaskDetails/MobileTaskDetails'
import messages from './Messages'
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
      widgetDescriptor('TaskReviewWidget'),
      widgetDescriptor('TaskHistoryWidget'),
      widgetDescriptor('TaskInstructionsWidget'),
      widgetDescriptor('TaskMapWidget'),
    ],
    layout: [
      {i: generateWidgetId(), x: 0, y: 0, w: 4, h: 9},
      {i: generateWidgetId(), x: 0, y: 9, w: 4, h: 8},
      {i: generateWidgetId(), x: 0, y: 17, w: 4, h: 4},
      {i: generateWidgetId(), x: 4, y: 0, w: 8, h: 18},
    ],
    excludeWidgets: [
      'TaskCompletionWidget',
    ]
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
    completionResponses: null
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname &&
        this.props.location.search !== prevProps.location.search) {
      window.scrollTo(0, 0)
    }

    if (_get(this.props, 'task.id') !== _get(prevProps, 'task.id')) {
      this.setState({completionResponses: null})
    }
  }

  setCompletionResponse = (propertyName, value) => {
    const responses =
      this.state.completionResponses ?
      Object.assign({}, this.state.completionResponses) :
      JSON.parse(_get(this.props, 'task.completionResponses', '{}'))

    responses[propertyName] = value
    this.setState({completionResponses: responses})
  }

  render() {
    if (!_isFinite(_get(this.props, 'task.id'))) {
      return (
        <div className="pane-loading full-screen-height">
          <BusySpinner />
        </div>
      )
    }

    if (this.props.task.isBundlePrimary && !this.props.taskBundle) {
      return (
        <div className="pane-loading full-screen-height">
          <BusySpinner />
        </div>
      )
    }

    const completionResponses = this.state.completionResponses ||
                                JSON.parse(_get(this.props, 'task.completionResponses', null)) || {}

    return (
      <div className='task-pane'>
        <MediaQuery query="(min-width: 1024px)">
          <WidgetWorkspace
            {...this.props}
            className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-pt-2 mr-pb-8 mr-cards-inverse"
            workspaceTitle={
              <div className="mr-flex mr-items-baseline mr-mt-4">
                <h2 className="mr-text-lg mr-my-0 mr-mr-2 mr-links-inverse">
                  <ChallengeNameLink {...this.props} suppressShareLink />
                </h2>
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
                    <div className="mr-links-green-lighter mr-text-sm mr-flex mr-items-center mr-mt-2">
                      <span className="mr-flex mr-items-baseline">
                        <FormattedMessage {...messages.taskLockedLabel} />
                      </span>
                      <button
                        onClick={() => this.props.stopReviewing(this.props.task, this.props.history)}
                        className="mr-button mr-button--xsmall mr-ml-3"
                      >
                        <FormattedMessage {...messages.taskUnlockLabel} />
                      </button>
                    </div>
                  )}
                />
              </div>
            }
            subheader={
              <div className="mr-text-xs mr-links-green-lighter mr-mt-1">
                {_get(this.props.task, 'parent.parent.displayName')}
              </div>
            }
            setCompletionResponse={this.setCompletionResponse}
            completionResponses={completionResponses}
            templateRevision={true}
            disallowBundleChanges={true}
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
    WithChallenge(
      WithTaskBundle(
        WithTaskReview(
          ReviewTaskPane
        )
      )
    ),
    WidgetDataTarget.task,
    WIDGET_WORKSPACE_NAME,
    defaultWorkspaceSetup
  )
)
