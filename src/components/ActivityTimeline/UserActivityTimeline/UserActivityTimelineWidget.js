import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import _groupBy from 'lodash/groupBy'
import _toPairs from 'lodash/toPairs'
import _isNumber from 'lodash/isNumber'
import _reverse from 'lodash/reverse'
import _sortBy from 'lodash/sortBy'
import _compact from 'lodash/compact'
import parse from 'date-fns/parse'
import startOfDay from 'date-fns/start_of_day'
import { ActivityItemType,
         typeLabels,
         keysByType }
       from '../../../services/Activity/ActivityItemTypes/ActivityItemTypes'
import { actionLabels,
         keysByAction }
       from '../../../services/Activity/ActivityActionTypes/ActivityActionTypes'
import { statusLabels,
         keysByStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'UserActivityTimelineWidget',
  label: messages.header,
  targets: [
    WidgetDataTarget.user,
  ],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 2,
  defaultHeight: 10,
}

/**
 * UserActivityTimelineWidget displays the given user activity in the form of a
 * timeline, with the most recent activity shown at the top. Activity is
 * grouped together by day.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class UserActivityTimelineWidget extends Component {
  componentDidMount() {
    if (this.props.user && this.props.fetchUserActivity) {
      this.props.fetchUserActivity(this.props.user.id)
    }
  }

  render() {
    const localizedActionLabels = actionLabels(this.props.intl)
    const localizedTypeLabels = typeLabels(this.props.intl)
    const localizedStatusLabels = statusLabels(this.props.intl)
    const challengeNames = new Map()

    // Begin by decorating the activity entries with supplemental data
    // that will make it easier for us to group and display.
    const decoratedActivities = _compact(_map(this.props.user.activity, entry => {
      if (entry.typeId !== ActivityItemType.task) {
        return null
      }

      challengeNames.set(entry.parentId, entry.parentName)

      return Object.assign({}, entry, {
        normalizedISODate: this.props.startOfDay(parse(entry.created)),
        challengeId: entry.parentId,
        description: `${localizedActionLabels[keysByAction[entry.action]]} ` +
                     localizedTypeLabels[keysByType[entry.typeId]] +
                     (_isNumber(entry.status) ?
                      ` as ${localizedStatusLabels[keysByStatus[entry.status]]}` : '')
      })
    }))

    // Group together entries by date.
    const groupedByDate = _toPairs(_groupBy(decoratedActivities, 'normalizedISODate'))

    // Consolidate entries for each date/challenge that have duplicate
    // descriptions into a Map (tracking the total count of the dups), so we
    // can keep the timeline tidy and show a count instead of simply repeating
    // the same action multiple times for a challenge.
    groupedByDate.forEach(dateGroup => {
      // Group activities on this day by challenge
      const groupedByChallenge = _toPairs(_groupBy(dateGroup[1], 'challengeId'))

      // Consolidate duplicate activities for each challenge into Map
      groupedByChallenge.forEach(challengeGroup => {
        challengeGroup[1] = challengeGroup[1].reduce(
          (challengeEntries, entry) => challengeEntries.set(
            entry.description,
            challengeEntries.get(entry.description) + 1 || 1
          ),
          new Map()
        )
      })
      dateGroup[1] = groupedByChallenge
    })

    // Sort date groups in descending date order.
    const latestEntries = _reverse(_sortBy(
      groupedByDate,
      pairs => parse(pairs[0]).getTime()
    ))

    // Build timeline entries for each day, showing each unique type of activity
    // for each challenge with a badge displaying the count of the number of
    // times that unique activity was performed that day.
    const timelineItems = _map(latestEntries, entriesByDate => {
      const challengeActivity = _map(entriesByDate[1], challengeEntries => {
        const activityEntries = []
        challengeEntries[1].forEach((count, description) =>
          activityEntries.push(
            <li key={description}>
              <span className="mr-badge">{count}</span> {description}
            </li>
          )
        )

        const challengeId = parseInt(challengeEntries[0], 10)
        const challengeName = challengeNames.get(challengeId)
        return (
          <li key={challengeId}>
            <h2 className="mr-timeline__name">
              <Link to={`/browse/challenges/${challengeId}`}>
                {challengeName}
              </Link>
            </h2>
            <ol className="mr-timeline__entries">
              {activityEntries}
            </ol>
          </li>
        )
      })

      return (
        <li key={entriesByDate[0]} className="mr-timeline__period">
          <h3 className="mr-timeline__header">
            {this.props.intl.formatDate(parse(entriesByDate[0]),
                                        {month: 'long', day: 'numeric'})}
          </h3>
          <ol className="mr-timeline__activity">
            {challengeActivity}
          </ol>
        </li>
      )
    })

    // If there is no reportable activity, indicate that on the timeline.
    if (timelineItems.length === 0) {
      timelineItems.push(
        <li key="no-activity" className="mr-timeline__period">
          <h3 className="mr-timeline__header">No Recent Activity</h3>
        </li>
      )
    }

    return (
      <QuickWidget
        {...this.props}
        className="user-timeline-activity-widget"
        widgetTitle={<FormattedMessage {...messages.header} />}
      >
        <ol className="mr-timeline">
          {timelineItems}
        </ol>
      </QuickWidget>
    )
  }
}

UserActivityTimelineWidget.propTypes = {
  /** To more easily facilitate unit testing */
  startOfDay: PropTypes.func,
}

UserActivityTimelineWidget.defaultProps = {
  startOfDay,
}

registerWidgetType(injectIntl(UserActivityTimelineWidget), descriptor)
