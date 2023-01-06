import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage,
         FormattedDate,
         FormattedTime,
         injectIntl } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _kebabCase from 'lodash/kebabCase'
import _each from 'lodash/each'
import _isUndefined from 'lodash/isUndefined'
import _indexOf from 'lodash/indexOf'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import _find from 'lodash/find'
import _noop from 'lodash/noop'
import AsColoredHashable from '../../interactions/Hashable/AsColoredHashable'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import { keysByStatus, messagesByStatus, TASK_STATUS_CREATED }
      from '../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus, keysByReviewStatus, messagesByReviewStatus,
      messagesByMetaReviewStatus }
      from '../../services/Task/TaskReview/TaskReviewStatus'
import { TaskHistoryAction } from '../../services/Task/TaskHistory/TaskHistory'
import { viewAtticOverpass } from '../../services/Overpass/Overpass'
import messages from './Messages'
import ErrorTagComment from '../ErrorTagComment/ErrorTagComment'


// Constants for userType
const REVIEWER_TYPE = "reviewer"
const META_REVIEWER_TYPE = "meta-reviewer"
const MAPPER_TYPE = "mapper"

// constants for toggle between time/entries and users/contributors
const USER_TOGGLE = "user"
const TIME_TOGGLE = "time"

/**
 * TaskHistoryList renders the given history as a list with some basic formatting,
 * starting with the most recent log entry.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class TaskHistoryList extends Component {
  state = {
    listType: TIME_TOGGLE,
  }

  render() {
    if (this.props.taskHistory.length === 0) {
      return <div className="mr-px-4 history-list none">No History</div>
    }

    let combinedLogs = []
    let entries = []
    let logEntry = null
    let lastTimestamp = null
    let username = null
    let updatedStatus = null
    let startedAtEntry = null
    let duration = null
    let userType = null
    let errorTags = null

    _each(_sortBy(this.props.taskHistory, h => new Date(h.timestamp)), (log, index) => {
      // We are moving on to a new set of actions so let's push
      // this set of entries
      if (lastTimestamp !== null && (entries.length > 0 || startedAtEntry) &&
          Math.abs(new Date(log.timestamp) - lastTimestamp) > 1000) {
        combinedLogs.push({timestamp: lastTimestamp,
                           duration: duration,
                           entry: entries,
                           username: username,
                           status: updatedStatus,
                           userType: userType})
        if (startedAtEntry) {
          combinedLogs.push(startedAtEntry)
          startedAtEntry = null
        }
        entries = []
        updatedStatus = null
        duration = null
        userType = null
      }
      lastTimestamp = new Date(log.timestamp)


      switch(log.actionType) {
        case TaskHistoryAction.comment:
          logEntry = commentEntry(log, this.props, index)
          username = _get(log, 'user.username')
          break
        case TaskHistoryAction.review:
        case TaskHistoryAction.metaReview:
          if (log.reviewStatus === TaskReviewStatus.needed) {
            username = _get(log, 'reviewRequestedBy.username')
            logEntry = reviewEntry(log, this.props, index)
          } else {
            logEntry = null
            const isMetaReview = log.actionType === TaskHistoryAction.metaReview
            updatedStatus =
                <ReviewStatusLabel
                  {...this.props}
                  isMetaReview={isMetaReview}
                  intlMessage={isMetaReview ?
                    messagesByMetaReviewStatus[log.reviewStatus] :
                    messagesByReviewStatus[log.reviewStatus]
                  }
                  className={`mr-review-${_kebabCase(keysByReviewStatus[log.reviewStatus])}`}
                  showDot
                />
            username = (log.reviewStatus === TaskReviewStatus.disputed ||
                        log.reviewStatus === TaskReviewStatus.needed) ?
              _get(log, 'reviewRequestedBy.username') : _get(log, 'reviewedBy.username')
            userType = log.actionType === TaskHistoryAction.metaReview ? META_REVIEWER_TYPE : REVIEWER_TYPE
            errorTags = log.errorTags
            if (log.startedAt) {
              duration = new Date(log.timestamp) - new Date(log.startedAt)

              //add an additional entry for when review was started
              const startedReviewAtEntry = {timestamp: (log.startedAt),
                ignoreAtticOffset: true,
                entry: [
                  <li className="mr-mb-4" key={"start-" + index}>
                    <div>
                      <span
                        className="mr-mr-2"
                        style={{color: AsColoredHashable(username).hashColor}}
                      >
                        {username}
                      </span> <FormattedMessage {...messages.startedReviewOnLabel} />
                    </div>
                  </li>
                ]}

                combinedLogs.push(startedReviewAtEntry)
            }
          }
          break
        case TaskHistoryAction.update:
          logEntry = updateEntry(log, this.props, index)
          username = _get(log, 'user.username')
          break
        case TaskHistoryAction.status:
        default:
          logEntry = null
          username = _get(log, 'user.username')
          userType = MAPPER_TYPE
          updatedStatus = statusEntry(log, this.props, index)
          if (log.startedAt || log.oldStatus === TASK_STATUS_CREATED) {
            // Add a "Started At" entry into the history
            startedAtEntry = {timestamp: (log.startedAt || log.timestamp),
                              ignoreAtticOffset: true,
                              entry: [
                                <li className="mr-mb-4" key={"start-" + index}>
                                  <div>
                                    <span
                                      className="mr-mr-2"
                                      style={{color: AsColoredHashable(username).hashColor}}
                                    >
                                      {username}
                                    </span> <FormattedMessage {...messages.startedOnLabel} />
                                  </div>
                                </li>
                              ]}
          }

          if (log.startedAt) {
            duration = new Date(log.timestamp) - new Date(log.startedAt)
          }
          break

      }
      entries.unshift(logEntry)
    })

    if (entries.length > 0) {
      combinedLogs.push({timestamp: lastTimestamp,
                         duration: duration,
                         entry: entries,
                         username: username,
                         status: updatedStatus,
                         userType: userType,
                         errorTags: errorTags})
      if (startedAtEntry) {
        combinedLogs.push(startedAtEntry)
        startedAtEntry = null
      }
    }

    const contributors = []
    _each(combinedLogs, (log) => {
      // Don't add a contributor twice
      if (log.userType &&
          !_find(contributors, c => (c.username === log.username &&
                                     c.userType === log.userType))) {
        contributors.push(log)
      }
    })

    const contributorEntries =
      <ol className="mr-list-decimal mr-pl-4">
        {_map(contributors, (c) => {
          let userType = ""
          switch(c.userType) {
            case REVIEWER_TYPE:
              userType = this.props.intl.formatMessage(messages.reviewerType)
              break
            case META_REVIEWER_TYPE:
              userType = this.props.intl.formatMessage(messages.metaReviewerType)
              break
            default:
              userType = this.props.intl.formatMessage(messages.mapperType)
              break
          }

          return (
            <li key={c.username + c.userType} className="">
              <span className="mr-w-40 mr-inline-block mr-px-2 mr-py-1"
                    style={{color: AsColoredHashable(c.username).hashColor}} >
                {c.username}
              </span>
              <span className="mr-inline-block mr-text-pink mr-py-1">
              {userType}
              </span>
            </li>
        )})}
      </ol>

    combinedLogs = _reverse(_sortBy(combinedLogs, log => new Date(log.timestamp)))

    const historyEntries = _map(combinedLogs, (log, index) => {
      return (
        <article key={'entry-' + index} className="mr-pr-4 mr-mb-8">
          <div className="mr-list-reset mr-links-green-lighter mr-mb-2 mr-text-xs">
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
                {log.duration &&
                  <span className="mr-pl-4 mr-text-pink">
                    {Math.floor(log.duration / 1000 / 60)}m {Math.floor(log.duration / 1000) % 60}s
                  </span>
                }
              </div>
              {!this.props.selectDiffs &&
                <a onClick={() => viewAtticOverpass(this.props.editor, log.timestamp,
                                    this.props.mapBounds.bounds, log.ignoreAtticOffset)}>
                  <FormattedMessage {...messages.viewAtticLabel} />
                </a>
              }
              {this.props.selectDiffs &&
               <input
                 className="mr-checkbox-toggle"
                 type="checkbox"
                 checked={_indexOf(this.props.selectedTimestamps, log.timestamp.toString()) !== -1}
                 onChange={() => this.props.toggleSelection(log.timestamp)}
               />
              }
            </div>
          </div>
          <ol className="mr-list-reset mr-text-sm mr-rounded-sm mr-p-2 mr-bg-black-15">
            {(log.username || log.status) &&
              <li className="mr-mb-4">
                <div className="mr-flex mr-justify-between">
                  <span style={{color: AsColoredHashable(log.username).hashColor}}>
                    {log.username}
                  </span>
                  {log.status}
                </div>
              </li>
            }
            {log.entry}
            {log.errorTags
              ? <div className="mr-text-red">
                  <FormattedMessage
                    {...messages.errorTagsLabel}
                  />:{" "}
                  <ErrorTagComment errorTags={errorTags} />
                </div>
              : null}
          </ol>
        </article>
      )}
    )

    const contributorToggle =
      <div className="mr-text-right mr-text-xs mr-mb-2">
        <span>
          <input
            type="radio"
            name="showByTime"
            className="mr-radio mr-mr-1"
            checked={this.state.listType === TIME_TOGGLE}
            onClick={() => this.setState({listType: TIME_TOGGLE})}
            onChange={_noop}
          />
          <label className="mr-ml-1 mr-mr-4">
            <FormattedMessage {...messages.listByTime}/>
          </label>
        </span>
        <span>
          <input
            type="radio"
            name="showByReviewers"
            className="mr-radio mr-mr-1"
            checked={this.state.listType === USER_TOGGLE}
            onClick={() => this.setState({listType: USER_TOGGLE})}
            onChange={_noop}
          />
          <label className="mr-ml-1 mr-mr-4">
            <FormattedMessage {...messages.listByUser}/>
          </label>
        </span>
      </div>

    return (
      <React.Fragment>
        {contributorToggle}
        {this.state.listType === TIME_TOGGLE && historyEntries}
        {this.state.listType === USER_TOGGLE && contributorEntries}
      </React.Fragment>
    )
  }
}

const reviewEntry = (entry, props, index) => {
  return (
    <li key={index}>
      {!_isUndefined(entry.reviewStatus) &&
        <ReviewStatusLabel
          {...props}
          isMetaReview={entry.actionType === TaskHistoryAction.metaReview}
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
        className="mr-fill-current mr-flex-shrink-0 mr-w-4 mr-h-4 mr-mt-3 mr-mr-2"
      />
      <MarkdownContent allowShortCodes markdown={entry.comment} />
    </li>
  )
}

const statusEntry = (entry, props) => {
  return (
    <TaskStatusLabel
      {...props}
      intlMessage={messagesByStatus[entry.status]}
      className={`mr-status-${_kebabCase(keysByStatus[entry.status])}`}
    />
  )
}

const updateEntry = (entry, props, index) => {
  return (
    <li key={index} className="mr-flex">
      <FormattedMessage {...messages.taskUpdatedLabel} />
    </li>
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
    {props.isMetaReview &&
      <span className="mr-text-xs mr-text-grey mr-text-italic mr-mr-2">
        <FormattedMessage {...messages.metaReviewLabel} />
      </span>
    }
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

export default injectIntl(TaskHistoryList)
