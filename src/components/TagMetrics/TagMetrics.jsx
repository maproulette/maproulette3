import { Fragment, Component } from 'react'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import _filter from 'lodash/filter'
import { TaskStatus, messagesByStatus }
      from '../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus, messagesByReviewStatus }
      from '../../services/Task/TaskReview/TaskReviewStatus'
import messages from './Messages'


/**
 * TagMetrics displays metrics by tag
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TagMetrics extends Component {
  buildTagStats = (metrics, totalTasks) => {
    const byTag = _map(_reverse(_sortBy(metrics, ['total','tagName'])), (tagMetrics) => {
      return (
        <div className="mr-grid mr-grid-columns-1 mr-grid-gap-4"
             key={`${tagMetrics.tagType}:${tagMetrics.tagName}`}>
        {tagMetrics.tagName !== "" &&
          buildMetric(
            tagMetrics,
            totalTasks,
            tagMetrics.tagName,
            this.props)
        }
        </div>
      )
    })
    return (
      <div>
        {byTag}
      </div>
    )
  }

  render() {
    if (this.props.tagMetricsUpdateAvailable) {
      return (
        <button className="mr-button" onClick={this.props.refreshTagMetrics}>
          <FormattedMessage {...messages.loadTagMetricsLabel} />
        </button>
      )
    }

    const tagMetrics = this.props.tagMetrics
    const totalTasks = this.props.totalTasks

    const reviewTags = _filter(tagMetrics, (t) => t.tagType === "review")
    const taskTags = _filter(tagMetrics, (t) => t.tagType === "tasks")

    return (
      <Fragment>
        <div className="mr-text-orange mr-my-2 heading">
          <FormattedMessage {...messages.reviewTags} />
        </div>
        <div className={classNames("tag-metrics mr-mb-4")}>
          {reviewTags && totalTasks > 0 &&
            this.buildTagStats(reviewTags, totalTasks)}
          {(!reviewTags || totalTasks === 0) &&
            <FormattedMessage {...messages.noTags} />
          }
        </div>

        <div className="mr-text-orange mr-my-2 heading">
          <FormattedMessage {...messages.taskTags} />
        </div>
        <div className={classNames("tag-metrics mr-mb-2")}>
          {taskTags && totalTasks > 0 &&
            this.buildTagStats(taskTags, totalTasks)}
          {(!tagMetrics || totalTasks === 0) &&
            <FormattedMessage {...messages.noTags} />
          }
        </div>
      </Fragment>
    );
  }
}

function buildMetric(metrics, total, description, props) {
  const tooltip =
    `${props.intl.formatMessage(messagesByReviewStatus[TaskReviewStatus.needed])}: ${metrics.reviewRequested} \n` +
    `${props.intl.formatMessage(messagesByReviewStatus[TaskReviewStatus.approved])}: ${metrics.reviewApproved} \n` +
    `${props.intl.formatMessage(messagesByReviewStatus[TaskReviewStatus.approvedWithFixes])}: ${metrics.reviewAssisted} \n` +
    `${props.intl.formatMessage(messagesByReviewStatus[TaskReviewStatus.rejected])}: ${metrics.reviewRejected} \n` +
    `${props.intl.formatMessage(messagesByReviewStatus[TaskReviewStatus.disputed])}: ${metrics.reviewDisputed} \n` +
    `-------\n` +
    `${props.intl.formatMessage(messagesByStatus[TaskStatus.fixed])}: ${metrics.fixed} \n` +
    `${props.intl.formatMessage(messagesByStatus[TaskStatus.tooHard])}: ${metrics.tooHard} \n` +
    `${props.intl.formatMessage(messagesByStatus[TaskStatus.alreadyFixed])}: ${metrics.falsePositive} \n` +
    `${props.intl.formatMessage(messagesByStatus[TaskStatus.skipped])}: ${metrics.skipped}`

  return (
    <div className="mr-grid mr-grid-columns-5 mr-grid-gap-2"
      title={tooltip}>
      <div className="mr-col-span-2 mr-my-1">
        <div>{description}</div>
      </div>
      <div className="mr-col-span-2 mr-text-pink mr-my-1">
        {metrics.total === 0 ? 0 : Math.round(metrics.total / total * 100)}%
        <div className="mr-text-xs mr-inline mr-text-grey mr-ml-4">
          ({metrics.total}/{total})
        </div>
      </div>

    </div>
  )
}
