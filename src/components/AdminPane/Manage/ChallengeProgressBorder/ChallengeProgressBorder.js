import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import { TaskStatus, TaskStatusColors, keysByStatus, statusLabels }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import messages from './Messages'

// Whitespace between each border segment
const SEGMENT_BUFFER_PX = 5

// Minimum length of a progress segment
const MIN_SEGMENT_PX=5

/**
 * Visual display of challenge completion progress as a bottom border. Each
 * task status is shown in a segment with its percentage width equal to its
 * percentage of completed actions, less a buffer between each segment.
 * Hovering over a segment colors the segment to match the status color used in
 * the traditional challenge progress bar chart, and also shows a tooltip with
 * the status name, percentage of completed actions in that status, and the
 * count of completed tasks in that status relative to the total count
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeProgressBorder extends Component {
  state = {
    hoveredStatus: null,
  }

  percent(value, total) {
    if (value === 0 || total === 0) return 0
    return Math.round(value / total * 100)
  }

  /**
   * Generate a border segment for the given task status based on the
   * percentage of completed actions in that status. Utilize a context object
   * for shared state between calls to this method, such as the cumulative
   * percentage of task actions that have been processed so far. The same
   * context instance should be included in each call to this method for all
   * the segments in a single progress border
   */
  borderSegmentForTaskStatus(status, actions, localizedStatuses, maxWidth, context={}, overrides={}) {
    const actionCount = actions[overrides.action ? overrides.action : keysByStatus[status]]
    const cumulativePercent = _get(context, 'cumulativePercent', 0)
    const cumulativeWidth = _get(context, 'cumulativeWidth', 0)
    const currentPercent = this.percent(actionCount, actions.total)
    let segmentWidth = Math.floor(Math.max(maxWidth * (currentPercent / 100.0), MIN_SEGMENT_PX))

    const segment = (
      <div
        key={status}
        className={classNames(overrides.border ? overrides.border : "mr-border-grey-light",
                             "mr-absolute mr-pin-b mr-mb-n2px mr-border-b-2 mr-h-5px")}
        style={{
          left: `${cumulativeWidth}px`,
          width: `${segmentWidth}px`,
          borderColor: this.state.hoveredStatus === status ?
                       (overrides.border ? overrides.border : TaskStatusColors[status]) :
                       undefined,
        }}
        onMouseEnter={() => this.setState({hoveredStatus: status})}
        onMouseLeave={() => this.setState({hoveredStatus: null})}
      >
        {this.state.hoveredStatus === status &&
          <div
            className="mr-absolute mr-mt-4 mr-bg-white mr-py-4 mr-px-2 mr-shadow mr-flex mr-z-50 mr-min-w-48"
            style={cumulativePercent > 50 ? {left: "-200px"} : undefined}
          >
            <div className="mr-w-4 mr-h-4" style={{backgroundColor: TaskStatusColors[status]}} />
            <div className="mr-ml-2 mr-text-xs mr-text-grey">
              {
                overrides.label ? overrides.label : localizedStatuses[keysByStatus[status]]
              }: {currentPercent}% ({actionCount}/{actions.total})
            </div>
          </div>
        }
      </div>
    )

    context.cumulativePercent = cumulativePercent + currentPercent
    context.cumulativeWidth = cumulativeWidth + segmentWidth + SEGMENT_BUFFER_PX

    return segment
  }

  render() {
    if (!this.props.challenge.actions || !this.props.dimensions) {
      return null
    }

    const localizedStatuses = statusLabels(this.props.intl)
    const orderedStatuses = [
      TaskStatus.fixed,
      TaskStatus.alreadyFixed,
      TaskStatus.falsePositive,
      TaskStatus.skipped,
      TaskStatus.tooHard,
    ]

    const actions = this.props.challenge.actions
    const maxWidth = this.props.dimensions.width - (SEGMENT_BUFFER_PX * orderedStatuses.length)

    // Create segments for the completed statuses
    const context = {}
    const borderSegments = _map(orderedStatuses, status => (
      this.borderSegmentForTaskStatus(status, actions, localizedStatuses, maxWidth, context)
    ))

    // Push a last segment for the remaining tasks with some overrides
    borderSegments.push(
      this.borderSegmentForTaskStatus(TaskStatus.created, actions, localizedStatuses, maxWidth, context, {
        action: "available",
        border: "mr-border-transparent",
        label: this.props.intl.formatMessage(messages.available),
      })
    )

    return borderSegments
  }
}

ChallengeProgressBorder.propTypes = {
  challenge: PropTypes.object,
  dimensions: PropTypes.object,
}

export default injectIntl(ChallengeProgressBorder)
