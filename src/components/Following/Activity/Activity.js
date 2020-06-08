import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  injectIntl,
  FormattedMessage,
  FormattedRelative,
  FormattedDate,
  FormattedTime
} from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _isFinite from 'lodash/isFinite'
import _uniqBy from 'lodash/uniqBy'
import _unionBy from 'lodash/unionBy'
import _throttle from 'lodash/throttle'
import parse from 'date-fns/parse'
import { fetchMultipleUserActivity } from '../../../services/User/User'
import { subscribeToAllTasks, unsubscribeFromAllTasks }
       from '../../../services/Task/Task'
import { ActivityItemType, messagesByType }
       from '../../../services/Activity/ActivityItemTypes/ActivityItemTypes'
import { messagesByAction }
       from '../../../services/Activity/ActivityActionTypes/ActivityActionTypes'
import { messagesByStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'
import BusySpinner from '../../BusySpinner/BusySpinner'
import messages from './Messages'

const PAGE_SIZE = 50

/**
 * Displays recent activity from users followed by this user
 */
export const Activity = props => {
  const [activity, setActivity] = useState(null)
  const [groupedActivity, setGroupedActivity] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const isGrouped = props.widgetConfiguration.activityIsGrouped
  const following = _get(props.data, 'user.following')
  const followingIds = new Set(_map(following, 'id'))

  useEffect(() => {
    if (!_isEmpty(following)) {
      fetchMultipleUserActivity(_map(following, 'osmProfile.id'), PAGE_SIZE, page)
      .then(newActivity => {
        setActivity(activity => _uniqBy((activity || []).concat(newActivity.activity), 'id'))
        setHasMore(newActivity.hasMore)
      })
    }
  }, [following, page])

  useEffect(
    () => setGroupedActivity(groupActivity(activity || [], isGrouped)),
    [activity, isGrouped]
  )

  useEffect(() => {
    // Refetch the first page of results and merge them in. Throttle to at most
    // one request per 10 seconds
    const refetchLatest = _throttle(() => {
      fetchMultipleUserActivity(_map(following, 'osmProfile.id'), PAGE_SIZE, 0)
      .then(latestActivity => {
        setActivity(activity => _unionBy(latestActivity.activity, activity, 'id'))
      })
    }, 10000, {leading: false, trailing: true})

    subscribeToAllTasks(message => {
      if (message.messageType === 'task-update' &&
          followingIds.has(message.data.byUser.userId)) {
        refetchLatest()
      }
    }, "FollowWidgetActivity")

    return () => unsubscribeFromAllTasks("FollowWidgetActivity")
  })

  if (!props.data || (!_isEmpty(following) && !activity)) {
    return <BusySpinner />
  }

  const userMap = _reduce(following, (m, u) => m.set(u.osmProfile.id, u), new Map())
  return (
    <div>
      {_isEmpty(activity) ?
       <FormattedMessage {...messages.noRecentActivity} /> :
       <React.Fragment>
         <input
           type="checkbox"
           className="mr-checkbox-toggle mr-ml-4 mr-mr-px"
           checked={isGrouped}
           onClick={() => props.updateWidgetConfiguration({activityIsGrouped: !isGrouped})}
           onChange={() => null}
         />
         <label> Group</label>
        <div className="mr-timeline mr-links-green-lighter">
          {_map(groupedActivity, entry =>
            <ActivityDescription
              {...props}
              key={`entry-desc-${entry.id}`}
              user={userMap.get(entry.osmUserId)}
              entry={entry}
            />
          )}
        </div>
        {hasMore &&
         <button
           className="mr-button mr-button--small"
           onClick={() => setPage(page + 1)}
         >
           Load More
         </button>
        }
      </React.Fragment>
      }
    </div>
  )
}

Activity.propTypes = {
  data: PropTypes.object,
}

export const ActivityTime = props => {
  const timestamp = parse(props.entry.created)
  const created = `${props.intl.formatDate(timestamp)} ${props.intl.formatTime(timestamp)}`
  return (
    <div
      className="mr-text-yellow mr-whitespace-no-wrap mr-leading-tight mr-capitalize mr-flex-grow-0"
      title={created}
    >
      {props.widgetConfiguration.showExactDates ?
       <span>
         <FormattedDate value={props.entry.created} /> <FormattedTime value={props.entry.created} />
       </span> :
       <FormattedRelative value={props.entry.created} />
      }
    </div>
  )
}

export const ActivityDescription = props => {
  if (!props.user) {
    return null
  }

  const challengeName =
    props.entry.typeId === ActivityItemType.task ?
    props.entry.parentName :
    null

  return (
    <div className="mr-flex mr-flex-col mr-timeline__period mr-timeline__period--vcentered">
      <div className="mr-flex mr-justify-between mr-items-center">
        <ActivityTime {...props} entry={props.entry} />
        <div className="mr-border-b-2 mr-border-white-10 mr-w-48 mr-mx-2 mr-flex-grow"></div>
        <Link to={`/user/metrics/${props.user.id}`} className="mr-flex-grow-0">
          {props.user.osmProfile.displayName}
        </Link>
      </div>
      <div className="mr-text-base mr-mt-5">
        <Link to={`/browse/challenges/${props.entry.parentId}`}>
          {challengeName}
        </Link>
      </div>
      <div>
        {_isFinite(props.entry.count) &&
         <span className="mr-badge mr-mr-2 mr-mt-1">{props.entry.count}</span>
        }
        <span>
          <FormattedMessage {...messagesByAction[props.entry.action]} />
        </span> <span>
          <FormattedMessage {...messagesByType[props.entry.typeId]} />
        </span> {
          _isFinite(props.entry.status) &&
          <React.Fragment>
            <FormattedMessage
              {...messages.statusTo}
            /> <FormattedMessage
              {...messagesByStatus[props.entry.status]}
            />
          </React.Fragment>
        }
      </div>
    </div>
  )
}

/**
 * Combines consecutive entries that contain identical descriptions of work,
 * along with a `count` field
 */
function groupActivity(activity, group) {
  if (!group || activity.length <= 1) {
    return activity
  }

  const groups = []
  let currentGroup = Object.assign({}, activity[0], {count: 1})
  for (let i = 1; i < activity.length; i++) {
    if (activity[i].osmUserId !== currentGroup.osmUserId ||
        activity[i].action !== currentGroup.action ||
        activity[i].typeId !== currentGroup.typeId ||
        activity[i].status !== currentGroup.status ||
        activity[i].parentId !== currentGroup.parentId) {
      groups.push(currentGroup)
      currentGroup = Object.assign({}, activity[i], {count: 0})
    }

    currentGroup.count += 1
  }

  groups.push(currentGroup)
  return groups
}

export default injectIntl(Activity)
