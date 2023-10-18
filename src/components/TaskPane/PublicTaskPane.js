import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import {
  WidgetDataTarget,
  widgetDescriptor,
} from '../../services/Widget/Widget'
import WithChallengePreferences from '../HOCs/WithChallengePreferences/WithChallengePreferences'
import WithCooperativeWork from '../HOCs/WithCooperativeWork/WithCooperativeWork'
import BusySpinner from '../BusySpinner/BusySpinner'
import WithPublicWidgetWorkspaces from '../HOCs/WithPublicWidgetWorkspaces/WithPublicWidgetWorkspaces'
import { PublicWidgetGrid } from '../PublicWidgetGrid/PublicWidgetGrid'
import ChallengeNameLink from '../ChallengeNameLink/ChallengeNameLink'
import { Redirect } from 'react-router'

const WIDGET_WORKSPACE_NAME = 'PUBLIC'
export const defaultWorkspaceSetup = function () {
  return {
    dataModelVersion: 2,
    name: WIDGET_WORKSPACE_NAME,
    label: 'Public Task',
    widgets: [
      widgetDescriptor('ChallengeShareWidget'),
      widgetDescriptor('TaskStatusWidget'),
      widgetDescriptor('OSMHistoryWidget'),
      widgetDescriptor('TaskHistoryWidget'),
      widgetDescriptor('PublicTaskInstructionsWidget'),
      widgetDescriptor('TaskMapWidget'),
    ],
    layout: [
      { i: '0', x: 10, y: 8, w: 2, h: 3 },
      { i: '1', x: 8, y: 8, w: 2, h: 3 },
      { i: '2', x: 4, y: 6, w: 4, h: 6 },
      { i: '3', x: 4, y: 0, w: 4, h: 5 },
      { i: '4', x: 0, y: 0, w: 4, h: 11 },
      { i: '5', x: 8, y: 0, w: 4, h: 8 },
    ],
    excludeWidgets: [ // Cannot be added to workspace
    'ReviewNearbyTasksWidget',
    ],
  }
}

/**
 * PublicTaskPane presents the preview page of a task. It contains
 * a workspace of different widgets with related information about a task,
 * including task context, challenge share control, task completion progress, task status
 * OSM history, task history, and task map.
 */
export class PublicTaskPane extends Component {
  state = {
    workspaceContext: {}
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

  render() {
    //render regular TaskPane for logged in users.
    const loggedIn = localStorage.getItem('isLoggedIn')
    if (loggedIn) {
      return (
        <Redirect
          to={`${this.props.match.url}`}
        />
      )
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
    WithCooperativeWork(PublicTaskPane),
    WidgetDataTarget.task,
    WIDGET_WORKSPACE_NAME,
    defaultWorkspaceSetup
  )
)
