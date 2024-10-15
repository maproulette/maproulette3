import { useState, useEffect } from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'
import { gql, useQuery } from '@apollo/client'
import _find from 'lodash/find'
import _reject from 'lodash/reject'
import _take from 'lodash/take'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../services/Widget/Widget'
import WithWidgetWorkspaces
       from '../../components/HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import WidgetWorkspace
       from '../../components/WidgetWorkspace/WidgetWorkspace'
import { subscribeToAllTasks, unsubscribeFromAllTasks }
       from '../../services/Task/Task'
import { ActivityActionType }
       from '../../services/Activity/ActivityActionTypes/ActivityActionTypes'
import AsTaskActivityMessage from '../../interactions/Message/AsTaskActivityMessage'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import WithErrors from '../../components/HOCs/WithErrors/WithErrors'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import SignIn from '../SignIn/SignIn'
import messages from './Messages'

const PAGE_SIZE = 50

const RECENT_ACTIVITY = gql`
  query Activity($osmIds: [Long!], $limit: Int, $page: Int) {
    recentActions(osmIds: $osmIds, limit: $limit, offset: $page) {
      id
      created
      typeId
      parentId
      parentName
      itemId
      action
      status
      user {
        id
        osmProfile {
          id
          displayName
          avatarURL
        }
      }
      task {
        id
        location
      }
      challenge {
        id
        name
        general {
          parent {
            id
            name
            displayName
          }
        }
      }
    }
  }
`
const WIDGET_WORKSPACE_NAME = "globalActivity"

export const defaultWorkspaceSetup = function() {
  return {
    dataModelVersion: 2,
    name: WIDGET_WORKSPACE_NAME,
    label: "Global Activity",
    widgets: [
      widgetDescriptor('ActivityListingWidget'),
      widgetDescriptor('ActivityMapWidget'),
    ],
    layout: [
      {i: generateWidgetId(), x: 0, y: 0, w: 4, h: 12},
      {i: generateWidgetId(), x: 4, y: 0, w: 8, h: 12},
    ],
  }
}

/**
 * Renders the Global Activity page
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const GlobalActivity = props => {
  const [liveActivity, setLiveActivity] = useState([])

  const { loading, error, data, refetch } = useQuery(RECENT_ACTIVITY, {
    variables: { osmIds: props.osmIds, limit: PAGE_SIZE, page: 0},
    fetchPolicy: 'no-cache',
    partialRefetch: true,
  })

  useEffect(() => {
    subscribeToAllTasks(message => {
      // If we've accumulated a full page's worth of live results, issue a
      // refetch to start with a clean slate. Otherwise update the live feed
      if (liveActivity.length >= PAGE_SIZE) {
        refetch()
        setLiveActivity([])
      }
      else {
        setLiveActivity(updateActivity(liveActivity, message))
      }
    }, "GlobalActivity")

    return () => unsubscribeFromAllTasks("GlobalActivity")
  })

  if (error) {
    throw error
  }

  if (!props.user) {
    return (
      props.checkingLoginStatus ?
      <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        <BusySpinner />
      </div> :
      <SignIn {...props} />
    )
  }

  if (loading) {
    return <BusySpinner />
  }

  return (
    <WidgetWorkspace
      {...props}
      className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-px-6 mr-py-8 mr-cards-inverse"
      workspaceTitle={
        <h1 className="mr-text-4xl mr-font-light"><FormattedMessage {...messages.title} /></h1>
      }
      lightMode={false}
      darkMode={true}
      activity={_take(liveActivity.concat(data.recentActions), PAGE_SIZE)}
    />
  )
}

const updateActivity = (activity, message) => {
  if (message.messageType === 'task-released') {
    // Remove viewed. If they changed status, that'll stay on the map; otherwise
    // it'll be removed since the user abandoned the task
    return _reject(activity, {action: ActivityActionType.taskViewed})
  }

  const activityItem = AsTaskActivityMessage(message).asActivityItem()

  // If message doesn't represent activity, or if we've already processed this
  // message (which can happen after an unsubscribe/resubscribe), do nothing
  if (!activityItem || _find(activity, ({created: message.meta.created}))) {
    return activity
  }

  const updatedActivity = activity.slice()
  updatedActivity.unshift(activityItem)
  return updatedActivity
}

export default
WithErrors(
  WithCurrentUser(
    WithWidgetWorkspaces(
      injectIntl(GlobalActivity),
      WidgetDataTarget.activity,
      WIDGET_WORKSPACE_NAME,
      defaultWorkspaceSetup
    )
  )
)
