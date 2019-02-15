import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../services/Widget/Widget'
import WithWidgetWorkspaces
       from '../../components/HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import WidgetWorkspace
       from '../../components/WidgetWorkspace/WidgetWorkspace'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import messages from './Messages'

const WIDGET_WORKSPACE_NAME = "userDashboard"

export const defaultWorkspaceSetup = function() {
  return {
    dataModelVersion: 2,
    name: WIDGET_WORKSPACE_NAME,
    label: "Dashboard",
    widgets: [
      widgetDescriptor('FeaturedChallengesWidget'),
      widgetDescriptor('PopularChallengesWidget'),
      widgetDescriptor('TopUserChallengesWidget'),
      widgetDescriptor('SavedChallengesWidget'),
      widgetDescriptor('SavedTasksWidget'),
      widgetDescriptor('UserActivityTimelineWidget'),
    ],
    layout: [
      {i: generateWidgetId(), x: 0, y: 0, w: 6, h: 6},
      {i: generateWidgetId(), x: 6, y: 0, w: 6, h: 6},
      {i: generateWidgetId(), x: 0, y: 6, w: 6, h: 6},
      {i: generateWidgetId(), x: 6, y: 6, w: 6, h: 6},
      {i: generateWidgetId(), x: 0, y: 12, w: 6, h: 6},
      {i: generateWidgetId(), x: 6, y: 12, w: 6, h: 12},
    ],
  }
}

class Dashboard extends Component {
  render() {
    return (
      <WidgetWorkspace
        {...this.props}
        className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-px-6 mr-py-8"
        workspaceTitle={
          <h1 className="mr-h2"><FormattedMessage {...messages.header} /></h1>
        }
      />
    )
  }
}

export default
WithCurrentUser(
  WithWidgetWorkspaces(
    Dashboard,
    WidgetDataTarget.user,
    WIDGET_WORKSPACE_NAME,
    defaultWorkspaceSetup
  )
)
