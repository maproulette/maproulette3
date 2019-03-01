import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage,
         FormattedDate,
         FormattedTime } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _kebabCase from 'lodash/kebabCase'
import _each from 'lodash/each'
import _isUndefined from 'lodash/isUndefined'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import { keysByStatus, messagesByStatus }
      from '../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus, keysByReviewStatus, messagesByReviewStatus }
      from '../../services/Task/TaskReview/TaskReviewStatus'
import { TaskHistoryAction } from '../../services/Task/TaskHistory/TaskHistory'

//import messages from './Messages'
//import './TaskHistoryList.scss'

/**
 * TaskHistoryList renders the given history as a list with some basic formatting,
 * starting with the most recent log entry.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskHistoryList extends Component {
  render() {
    if (this.props.taskHistory.length === 0) {
      return <div className="mr-px-4 history-list none">No History</div>
    }

    const combinedLogs = []
    var entries = []
    var logEntry = null
    var lastTimestamp = null

    _each(this.props.taskHistory, (log, index) => {
      if (lastTimestamp !== null && entries.length > 0 &&
          new Date(log.timestamp) - lastTimestamp > 100) {
        combinedLogs.push({timestamp: new Date(log.timestamp), entry: entries})
        entries = []
      }
      lastTimestamp = new Date(log.timestamp)


      switch(log.actionType) {
        case TaskHistoryAction.comment:
          logEntry =
            <div key={index}>
              {commentEntry(log, this.props)}
            </div>
          break
        case TaskHistoryAction.review:
          logEntry =
            <div key={index}>
              {reviewEntry(log, this.props)}
            </div>
          break
        case TaskHistoryAction.status:
        default:
          logEntry =
            <div key={index}>
              {statusEntry(log, this.props)}
            </div>
          break

      }
      entries.push(logEntry)
    })

    if (entries.length > 0) {
      combinedLogs.push({timestamp: lastTimestamp, entry: entries})
    }

    const historyEntries = _map(combinedLogs, (log, index) => {
      return (
        <article key={'entry-' + index} className="mr-pr-4 mr-mb-4">
          <div className="mr-list-reset mr-mb-2 mr-text-xs">
            <span className="mr-font-medium">
              <FormattedTime
                value={log.timestamp}
                hour='2-digit'
                minute='2-digit'
              />, <FormattedDate
                value={log.timestamp}
                year='numeric'
                month='long'
                day='2-digit'
              />
            </span>
          </div>
          {log.entry}
        </article>
      )}
    )

    return (
      <React.Fragment>{historyEntries}</React.Fragment>
    )
  }
}

const reviewEntry = (entry, props) => {
  if (entry.reviewStatus === TaskReviewStatus.needed) {
    return (
      <div className={classNames("mr-text-sm mr-rounded-sm mr-p-2",
                                 {"mr-bg-grey-lighter": props.lightMode,
                                  "mr-bg-grey-lighter-10": !props.lightMode})}>
        <div>{_get(entry, 'reviewRequestedBy.username')} requested a review</div>
      </div>
    )
  }
  else {
    return (
      <div className={classNames("mr-text-sm mr-rounded-sm mr-p-2",
                                 {"mr-bg-grey-lighter": props.lightMode,
                                  "mr-bg-grey-lighter-10": !props.lightMode})}>
        <div>{_get(entry, 'reviewedBy.username')} reviewed this task</div>
        <div>
          {!_isUndefined(entry.reviewStatus) &&
            <StatusLabel
              {...props}
              intlMessage={messagesByReviewStatus[entry.reviewStatus]}
              className={`mr-review-${_kebabCase(keysByReviewStatus[entry.reviewStatus])}`}
            />
          }
        </div>
      </div>
    )
  }
}

const commentEntry = (entry, props) => {
  return (
    <div className={classNames("mr-text-sm mr-rounded-sm mr-p-2",
                               {"mr-bg-grey-lighter": props.lightMode,
                                "mr-bg-grey-lighter-10": !props.lightMode})}>
      <span> {_get(entry, 'user.username')} commented: </span>
      <MarkdownContent markdown={entry.comment} />
    </div>
  )
}

const statusEntry = (entry, props) => {
  return (
    <div className={classNames("mr-text-sm mr-rounded-sm mr-p-2",
                               {"mr-bg-grey-lighter": props.lightMode,
                                "mr-bg-grey-lighter-10": !props.lightMode})}>
      <div>{_get(entry, 'user.username')} updated the status of this task. From:</div>
      <div>
        {!_isUndefined(entry.oldStatus) &&
          <StatusLabel
            {...props}
            intlMessage={messagesByStatus[entry.oldStatus]}
            className={`mr-status-${_kebabCase(keysByStatus[entry.oldStatus])}`}
          />
        }
      </div>
      <div>to: </div>
      <div>
        {!_isUndefined(entry.status) &&
          <StatusLabel
            {...props}
            intlMessage={messagesByStatus[entry.status]}
            className={`mr-status-${_kebabCase(keysByStatus[entry.status])}`}
          />
        }
      </div>
    </div>
  )
}

const StatusLabel = props => (
  <span
    className={classNames('mr-inline-flex mr-items-center', props.className)}
  >
    <span className="mr-w-2 mr-h-2 mr-rounded-full mr-bg-current" />
    <span className="mr-ml-2 mr-text-xs mr-uppercase mr-tracking-wide">
      <FormattedMessage {...props.intlMessage} />
    </span>
  </span>
)

TaskHistoryList.propTypes = {
  /** The history to display */
  taskHistory: PropTypes.arrayOf(
    PropTypes.shape({
      actionType: PropTypes.integer,
      timestamp: PropTypes.string,
      comment: PropTypes.string,
    })
  ),
}

TaskHistoryList.defaultProps = {
  taskHistory: [],
}
