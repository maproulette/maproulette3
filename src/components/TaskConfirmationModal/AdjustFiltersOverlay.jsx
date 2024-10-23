import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _get from 'lodash/get'
import _map from 'lodash/map'
import { TaskStatus, messagesByStatus, keysByStatus }
       from '../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus, isNeedsReviewStatus,
         messagesByReviewStatus, keysByReviewStatus }
      from '../../services/Task/TaskReview/TaskReviewStatus'
import { TaskPriority, messagesByPriority, keysByPriority }
      from '../../services/Task/TaskPriority/TaskPriority'
import messages from './Messages'

/**
 * AdjustFiltersOverlay shows a box with current review filters and allows
 * user to change them.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class AdjustFiltersOverlay extends Component {
  render() {
    const currentFilters = _get(this.props.currentFilters, 'filters', {})
    const challengeName = _get(this.props.challenge, 'name', '')
    const invertFields = _get(this.props.currentFilters, 'invertFields', {})

    const reviewStatusFilter =
      <div className="mr-mt-4">
        <label htmlFor="review-status-label" className="mr-w-32 mr-inline-block">
          <FormattedMessage {...messages.reviewStatusLabel} />
        </label>
        <select
          id="review-status-label"
          className="mr-text-white mr-select mr-w-48"
          onChange={event => this.props.filterChange('reviewStatus', event.target.value)}
          value={currentFilters.reviewStatus ? currentFilters.reviewStatus : 'all'}
        >
          <option key="all" value="all">All</option>
          {
            _map(TaskReviewStatus, (status) => {
              if (isNeedsReviewStatus(status)) {
                return (
                  <option key={keysByReviewStatus[status]} value={status}>
                    {this.props.intl.formatMessage(messagesByReviewStatus[status])}
                  </option>
                )
              }
            })
          }
        </select>
      </div>

    const statusFilter =
      <div className="mr-mt-4">
        <label htmlFor="status-select" className="mr-w-32 mr-inline-block">
          <FormattedMessage {...messages.statusLabel} />
        </label>
        <select
          id="status-select"
          className="mr-text-white mr-select mr-w-48"
          onChange={event => this.props.filterChange('status', event.target.value)}
          value={currentFilters.status ? currentFilters.status : 'all'}
        >
          <option key="all" value="all">All</option>
          {
            _map(TaskStatus, (status) => {
              return (
                <option key={keysByStatus[status]} value={status}>
                  {this.props.intl.formatMessage(messagesByStatus[status])}
                </option>
              )
            })
          }
        </select>
      </div>

    const priorityFilter =
      <div className="mr-mt-4">
        <label htmlFor="priority-select" className="mr-w-32 mr-inline-block">
          <FormattedMessage {...messages.priorityLabel} />
        </label>
        <select
          id="priority-label" 
          className="mr-text-white mr-select mr-w-48"
          onChange={event => this.props.filterChange('priority', event.target.value)}
          value={currentFilters.priority ? currentFilters.priority : 'all'}
        >
          <option key="all" value="all">All</option>
          {
            _map(TaskPriority, (priority) => {
              return (
                <option key={keysByPriority[priority]} value={priority}>
                  {this.props.intl.formatMessage(messagesByPriority[priority])}
                </option>
              )
            })
          }
        </select>
      </div>

    const challengeFilter =
      <div className="mr-mt-4">
        <label htmlFor="challenge-label" className="mr-w-32 mr-inline-block">
          <FormattedMessage {...messages.challengeLabel} />
        </label>
        <input id="mapper-label" 
               type="text"
               className="mr-text-white mr-input mr-w-64"
               value={currentFilters.challenge || ""}
               onChange={event => this.props.filterChange('challenge', event.target.value)}/>

        <button
          className={classNames("mr-text-current mr-justify-center mr-ml-2 mr-text-xs",
                               {"mr-text-white-40": !invertFields['challenge'],
                                "mr-text-pink": invertFields['challenge']})}
          onClick={(e) => {
            e.stopPropagation()
            this.props.filterChange('challenge', currentFilters.challenge, !invertFields['challenge'])
          }}
        >
          {invertFields['challenge'] ?
            <FormattedMessage {...messages.invertedLabel} /> :
            <FormattedMessage {...messages.invertLabel} />
          }
        </button>

        {currentFilters.challenge !== challengeName &&
          <button onClick={() => this.props.filterChange('challenge', challengeName)}
                  className="mr-text-green-lighter hover:mr-text-white mr-text-xs mr-pt-1 mr-ml-32 mr-block">
            <FormattedMessage {...messages.useChallengeLabel} />
          </button>
        }
      </div>

    const mapperFilter =
      <div className="mr-mt-4">
        <label htmlFor="mapper-label" className="mr-w-32 mr-inline-block">
          <FormattedMessage {...messages.mapperLabel} />
        </label>
        <input id="mapper-label" 
               type="text"
               className="mr-text-white mr-input mr-w-64"
               value={currentFilters.reviewRequestedBy}
               onChange={event => this.props.filterChange('reviewRequestedBy', event.target.value)}/>
      </div>

    return (
      <div className="mr-absolute mr-bottom-0 mr-left-0 mr-bg-blue-darker mr-w-full mr-h-100 mr-mt-32">
        <div className="mr-mt-12 mr-ml-4">
          {reviewStatusFilter}
          {statusFilter}
          {priorityFilter}
          {challengeFilter}
          {mapperFilter}
        </div>
        <div className="mr-w-full mr-text-center mr-absolute mr-bottom-0">
          <button
            onClick={() => this.props.close()}
            className="mr-button mr-w-4/5 mr-mb-8"
          >
            <FormattedMessage {...messages.doneLabel} />
          </button>
        </div>
      </div>
    )
  }
}
