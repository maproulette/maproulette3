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
import _indexOf from 'lodash/indexOf'
import _sortBy from 'lodash/sortBy'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import { keysByStatus, messagesByStatus, TASK_STATUS_CREATED }
      from '../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus, keysByReviewStatus, messagesByReviewStatus }
      from '../../services/Task/TaskReview/TaskReviewStatus'
import { TaskHistoryAction } from '../../services/Task/TaskHistory/TaskHistory'
import { viewAtticOverpass } from '../../services/Overpass/Overpass'
import { mapColors } from '../../interactions/User/AsEndUser'
import messages from './Messages'


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
    var username = null
    var updatedStatus = null
    var startedAtEntry = null

    _each(this.props.taskHistory, (log, index) => {
      if (lastTimestamp !== null && entries.length > 0 &&
          new Date(log.timestamp) - lastTimestamp < -1000) {
        combinedLogs.push({timestamp: new Date(log.timestamp),
                           entry: entries,
                           username: username,
                           status: updatedStatus})
        if (startedAtEntry) {
          combinedLogs.push(startedAtEntry)
          startedAtEntry = null
        }
        entries = []
        updatedStatus = null
      }
      lastTimestamp = new Date(log.timestamp)


      switch(log.actionType) {
        case TaskHistoryAction.comment:
          logEntry = commentEntry(log, this.props, index)
          username = _get(log, 'user.username')
          break
        case TaskHistoryAction.review:
          if (log.reviewStatus === TaskReviewStatus.needed) {
            username = _get(log, 'reviewRequestedBy.username')
            logEntry = reviewEntry(log, this.props, index)
          }
          else {
            logEntry = null
            updatedStatus =
                <ReviewStatusLabel
                  {...this.props}
                  intlMessage={messagesByReviewStatus[log.reviewStatus]}
                  className={`mr-review-${_kebabCase(keysByReviewStatus[log.reviewStatus])}`}
                  showDot
                />
            username = _get(log, 'reviewedBy.username')
          }
          break
        case TaskHistoryAction.status:
        default:
          logEntry = null
          username = _get(log, 'user.username')
          updatedStatus = statusEntry(log, this.props, index)

          if (log.startedAt || log.oldStatus === TASK_STATUS_CREATED) {
            startedAtEntry = {timestamp: (log.startedAt || log.timestamp),
                              ignoreAtticOffset: true,
                              entry: [
                                <li className="mr-mb-4" key={"start-" + index}>
                                  <div>
                                    <span className={classNames("mr-mr-2", mapColors(username))}>
                                      {username}
                                    </span> <FormattedMessage {...messages.startedOnLabel} />
                                  </div>
                                </li>
                              ]}
          }

          break

      }
      entries.unshift(logEntry)
    })

    if (entries.length > 0) {
      combinedLogs.push({timestamp: lastTimestamp,
                         entry: entries,
                         username: username,
                         status: updatedStatus})
      if (startedAtEntry) {
        combinedLogs.push(startedAtEntry)
        startedAtEntry = null
      }
    }

    _sortBy(combinedLogs, ['timestamp'])

    const historyEntries = _map(combinedLogs, (log, index) => {
      return (
        <article key={'entry-' + index} className="mr-pr-4 mr-mb-8">
          <div className="mr-list-reset mr-mb-2 mr-text-xs">
            <div className="mr-flex mr-justify-between">
              <div className="mr-font-medium">
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
              </div>
              {!this.props.selectDiffs &&
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a onClick={() => viewAtticOverpass(this.props.editor, log.timestamp,
                                    this.props.mapBounds.bounds, log.ignoreAtticOffset)}>
                  <FormattedMessage {...messages.viewAtticLabel} />
                </a>
              }
              {this.props.selectDiffs &&
                <label className="checkbox">
                  <input type="checkbox"
                         checked={_indexOf(this.props.selectedTimestamps, log.timestamp.toString()) !== -1}
                         onChange={() => this.props.toggleSelection(log.timestamp)} />
                </label>
              }
            </div>
          </div>
          <ol className="mr-list-reset mr-text-sm mr-rounded-sm mr-p-2 mr-bg-grey-lighter-10">
            {(log.username || log.status) &&
              <li className="mr-mb-4">
                <div className="mr-flex mr-justify-between">
                  <span className={mapColors(log.username)}>{log.username}</span>
                  {log.status}
                </div>
              </li>
            }
            {log.entry}
          </ol>
        </article>
      )}
    )

    return (
      <React.Fragment>{historyEntries}</React.Fragment>
    )
  }
}

const reviewEntry = (entry, props, index) => {
  return (
    <li key={index}>
      {!_isUndefined(entry.reviewStatus) &&
        <ReviewStatusLabel
          {...props}
          intlMessage={messagesByReviewStatus[entry.reviewStatus]}
          className={`mr-review-${_kebabCase(keysByReviewStatus[entry.reviewStatus])}`}
        />
      }
    </li>
  )
}

const commentEntry = (entry, props, index) => {
  return (
    <li key={index} className="mr-flex">
      <SvgSymbol
        sym="comments-icon"
        viewBox="0 0 20 20"
        className="mr-fill-current mr-flex-no-shrink mr-w-4 mr-h-4 mr-mt-3 mr-mr-2"
      />
      <MarkdownContent allowShortCodes markdown={entry.comment} />
    </li>
  )
}

const statusEntry = (entry, props, index) => {
  return (
    <TaskStatusLabel
      {...props}
      intlMessage={messagesByStatus[entry.status]}
      className={`mr-status-${_kebabCase(keysByStatus[entry.status])}`}
    />
  )
}

const TaskStatusLabel = props => (
  <span className='mr-inline-flex mr-items-center'>
    <span className={classNames("mr-w-2 mr-h-2 mr-rounded-full mr-bg-current", props.className)} />
    <span className="mr-ml-2 mr-text-sm mr-tracking-wide">
      <FormattedMessage {...props.intlMessage} />
    </span>
  </span>
)

const ReviewStatusLabel = props => (
  <span className='mr-inline-flex mr-items-center'>
    {props.showDot &&
      <span className={classNames("mr-w-2 mr-h-2 mr-rounded-full mr-bg-current",
                       props.className)} />}
    <span className={classNames("mr-text-sm mr-tracking-wide",
                                props.showDot ? "mr-ml-2": null)}>
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
