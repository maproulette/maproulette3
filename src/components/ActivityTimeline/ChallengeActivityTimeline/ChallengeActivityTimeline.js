import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import classNames from 'classnames'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _groupBy from 'lodash/groupBy'
import _toPairs from 'lodash/toPairs'
import _reverse from 'lodash/reverse'
import _sortBy from 'lodash/sortBy'
import _take from 'lodash/take'
import _isFinite from 'lodash/isFinite'
import parse from 'date-fns/parse'
import { statusLabels,
         keysByStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'
import '../ActivityTimeline.scss'

/**
 * ChallengeActivityTimeline displays recent challenge activity from the given
 * challenge in the form of a Bulma timeline, with the most recent activity
 * shown at the top. Activity is grouped together by day.
 *
 * @see https://wikiki.github.io/components/timeline/
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeActivityTimeline extends Component {
  render() {
    const localizedStatusLabels = statusLabels(this.props.intl)

    // Each status will receive its own entry for a given date (with a count of
    // zero if there is nothing on that day for that status). We group them
    // together by date, then sort in descending order by date so the most
    // recent activity will show up first.
    const groupedByDate = _toPairs(_groupBy(this.props.activity, 'date'))
    const latestEntries = _reverse(
      _sortBy(groupedByDate, (value) => parse(value[0]).getTime())
    )

    // Build timeline entries for each day, showing each (non-zero) type of
    // activity with a badge displaying the count.
    let timelineItems = _compact(_map(latestEntries, entriesByDate => {
      const isoDate = entriesByDate[0]
      const statusEntries = entriesByDate[1]

      const formattedDate = this.props.intl.formatDate(parse(isoDate),
                                                       {month: 'long', day: 'numeric'})
      const statuses = _compact(_map(statusEntries, entry => {
        if (entry.count === 0) {
          return null
        }

        return (
          <p key={`${isoDate}-${entry.status}`}
             className="timeline-item__activity-entry">
            <span className={classNames("badge", {inverted: this.props.invertBadges})}
                  data-badge={entry.count}>
              {localizedStatusLabels[keysByStatus[entry.status]]}
            </span>
          </p>
        )
      }))

      return statuses.length === 0 ? null : (
        <div key={isoDate} className="timeline-item">
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <p className="heading">{formattedDate}</p>
            {statuses}
          </div>
        </div>
      )
    }))

    // If a limit on timeline entries has been given, honor it.
    if (_isFinite(this.props.maxEntries)) {
      timelineItems = _take(timelineItems, this.props.maxEntries)
    }

    // If there is no reportable activity, show that on the timeline.
    if (timelineItems.length === 0) {
      timelineItems.push(
        <div key="no-activity" className="timeline-item no-activity">
          <div className="timeline-content">
            <p className="heading">No Recent Activity</p>
          </div>
        </div>
      )
    }

    return (
      <div className="timeline activity-timeline">
        <header className="timeline-header">
          <span className="tag is-medium">Latest</span>
        </header>

        {timelineItems}

        <div className="timeline-header">
          <span className="tag is-medium">End</span>
        </div>
      </div>
    )
  }
}

ChallengeActivityTimeline.propTypes = {
  /** The activity to display on the timeline */
  activity: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    statusName: PropTypes.string,
  })),
  invertBadges: PropTypes.bool,
}

ChallengeActivityTimeline.defaultProps = {
  activity: [],
  invertBadges: true,
}

export default injectIntl(ChallengeActivityTimeline)
