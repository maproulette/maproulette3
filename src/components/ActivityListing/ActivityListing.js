import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import ActivityDescription from './ActivityDescription'
import messages from './Messages'

/**
 * Displays recent activity, optionally filtered by user
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const Activity = props => {
  const [groupedActivity, setGroupedActivity] = useState([])

  useEffect(
    () => setGroupedActivity(groupActivity(props.activity || [], props.isGrouped)),
    [props.activity, props.isGrouped]
  )

  return (
    <div className="mr-text-white">
      {_isEmpty(props.activity) ?
       <FormattedMessage {...messages.noRecentActivity} /> :
       <React.Fragment>
         {props.toggleIsGrouped &&
          <React.Fragment>
            <input
              type="checkbox"
              className="mr-checkbox-toggle mr-ml-4 mr-mr-px"
              checked={props.isGrouped}
              onClick={props.toggleIsGrouped}
              onChange={() => null}
            />
            <label className="mr-ml-2"><FormattedMessage {...messages.groupLabel} /></label>
          </React.Fragment>
         }
         <div className="mr-timeline mr-links-green-lighter">
           {_map(groupedActivity, entry =>
             <ActivityDescription
               {...props}
               key={`entry-desc-${entry.id}`}
               entry={entry}
             />
           )}
         </div>
        </React.Fragment>
      }
    </div>
  )
}

Activity.propTypes = {
  activity: PropTypes.array,
  isGrouped: PropTypes.bool,
  toggleIsGrouped: PropTypes.func,
}

/**
 * Combines consecutive entries that contain identical descriptions of work,
 * along with a `count` field
 */
export const groupActivity = (activity, group) => {
  if (!group || activity.length <= 1) {
    return activity
  }

  const groups = []
  let currentGroup = Object.assign({}, activity[0], {count: 1})
  for (let i = 1; i < activity.length; i++) {
    if (!activity[i].parentId) {
      continue
    }

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

export default Activity
