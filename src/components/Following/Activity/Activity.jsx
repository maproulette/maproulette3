import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useQuery } from '@apollo/client'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _find from 'lodash/find'
import _map from 'lodash/map'
import _uniqBy from 'lodash/uniqBy'
import { subscribeToAllTasks, unsubscribeFromAllTasks }
       from '../../../services/Task/Task'
import AsTaskActivityMessage
       from '../../../interactions/Message/AsTaskActivityMessage'
import BusySpinner from '../../BusySpinner/BusySpinner'
import ActivityListing from '../../ActivityListing/ActivityListing'
import { RECENT_ACTIVITY } from '../FollowingQueries'
import messages from './Messages'

const PAGE_SIZE = 50

/**
 * Displays recent activity from users followed by this user
 */
export const Activity = props => {
  const [activity, setActivity] = useState(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [mounted, setMounted] = useState(false)
  const following = _get(props.data, 'user.following')
  const followingIds = new Set(_map(following, 'id'))

  const { loading, error, data, refetch } = useQuery(RECENT_ACTIVITY, {
    variables: { osmIds: _map(following, 'osmProfile.id'), limit: PAGE_SIZE, page},
    partialRefetch: true,
    onCompleted: () => setMounted(true)
  })

  useEffect(() => {
    if (!mounted && refetch) {
      refetch()
      setMounted(true)
    }
  }, [mounted, refetch])

  useEffect(() => {
    if (!_isEmpty(following) && data) {
      setActivity(activity => _uniqBy((activity || []).concat(data.recentActions), 'id'))
      setHasMore(data.recentActions.length >= PAGE_SIZE)
    }
  }, [following, data])

  useEffect(() => {
    subscribeToAllTasks(message => {
      if (message.messageType === 'task-completed' &&
          followingIds.has(message.data.byUser.userId)) {
        setActivity(activity => addLiveActivity(activity, message))
      }
    }, "FollowWidgetActivity")

    return () => unsubscribeFromAllTasks("FollowWidgetActivity")
  })

  if (error) {
    throw error
  }

  if (loading || !props.data) {
    return <BusySpinner />
  }

  return (
    <div>
      <ActivityListing
        activity={activity}
        showExactDates={props.showExactDates}
        isGrouped={props.widgetConfiguration.activityIsGrouped}
        toggleIsGrouped={() => props.updateWidgetConfiguration({
          activityIsGrouped: !props.widgetConfiguration.activityIsGrouped
        })}
      />
      {hasMore &&
        <button
          className="mr-button mr-button--small"
          onClick={() => setPage(page + 1)}
        >
          <FormattedMessage {...messages.loadMoreLabel} />
        </button>
      }
    </div>
  )
}

function addLiveActivity(activity, message) {
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

export default Activity
