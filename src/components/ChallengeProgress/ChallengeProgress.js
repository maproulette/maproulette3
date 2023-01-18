import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl'
import { ResponsiveBar } from '@nivo/bar'
import _isObject from 'lodash/isObject'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _each from 'lodash/each'
import _chunk from 'lodash/chunk'
import _isEqual from 'lodash/isEqual'
import { TaskPriority, keysByPriority, taskPriorityLabels }
       from '../../services/Task/TaskPriority/TaskPriority'
import { TaskStatus, TaskStatusColors, keysByStatus, statusLabels }
       from '../../services/Task/TaskStatus/TaskStatus'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './ChallengeProgress.scss'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'

const colors = resolveConfig(tailwindConfig).theme.colors

export const ProgressTooltip = (props) => {
  return (
    <div className="mr-bg-black mr-p-2 mr-flex mr-items-center mr-color-white">
      <div className="mr-w-3 mr-h-3 mr-mr-2" style={{ backgroundColor: props.input.color }} />
      <div>{props.input.label}</div>
      <div className="mr-ml-1 mr-font-bold">{props.input.value}%</div>
    </div>
  )
}

const theme = (lightMode = false) => {
  return {
    axis: {
      fontSize: ".75rem",
      tickColor: (lightMode ? colors.grey : colors.white),
      ticks: {
        line: {
          stroke: (lightMode ? colors.grey : colors.white)
        },
        text: {
          fill: (lightMode ? colors.grey : colors.white)
        }
      },
      legend: {
        text: {
          fill: (lightMode ? colors.grey : colors.white)
        }
      }
    },
    grid: {
      line: {
        stroke: "#555555"
      }
    },
    tooltip: {
      container: {
        color: lightMode ? colors.black : colors.white,
        background: lightMode ? colors.white : colors.black,
        stroke: colors.white,
      }
    }
  }
}

const orderedStatuses = [
  TaskStatus.fixed,
  TaskStatus.alreadyFixed,
  TaskStatus.falsePositive,
  TaskStatus.skipped,
  TaskStatus.tooHard,
  // No 'available' here: we'll append that to the orderedKeys below.
]

export class ChallengeProgress extends Component {
  percent = (value, total) => {
    if (value === 0 ) return 0
    return Math.round(value / total * 100)
  }

  shouldComponentUpdate(nextProps) {
    // Only re-render if the challenge or actions changed
    if (!_isEqual(nextProps.taskMetrics, this.props.taskMetrics)) {
      return true
    }

    if (_get(nextProps, 'challenge.id') !== _get(this.props, 'challenge.id')) {
      return true
    }

    if (!_isEqual(_get(nextProps, 'challenge.actions', {}),
                  _get(this.props, 'challenge.actions', {}))) {
      return true
    }

    if (!_isEqual(this.props.showByPriority, nextProps.showByPriority)) {
      return true
    }

    return false
  }

  generatePercentages(taskActions, challengeStatsColumns) {
    return (
      <div className="mr-text-sm mr-grid mr-grid-columns-2 mr-grid-gap-4">
        {_map(challengeStatsColumns, (stats, index1) => (
          <ul key={index1} className={this.props.listClassName}>
              {_map(stats, (stat, index2) => (
                <li className="mr-flex mr-items-center" key={index1 + "-" + index2}>
                  <span
                    className="mr-text-lg mr-min-w-8 mr-text-right mr-text-pink"
                  >
                    {this.props.prominentCounts ?
                     <React.Fragment>
                       {stat[1].count >= 0 ? stat[1].count : '--'}
                     </React.Fragment> :
                     <React.Fragment>
                       {isNaN(stat[1].percent) ? '--' :
                       /* eslint-disable-next-line react/style-prop-object */
                       <FormattedNumber style="percent" value={stat[1].percent / 100} />
                       }
                     </React.Fragment>
                    }
                  </span>
                  <span
                    className={classNames(
                      "mr-ml-2",
                      this.props.prominentCounts ? "mr-text-lg" : "mr-uppercase"
                    )}
                  >
                    {stat[0]}{' '}
                    <span className={this.props.prominentCounts ? "mr-text-base" : "mr-text-xs"}>
                      {this.props.prominentCounts ?
                       <React.Fragment>
                         ({isNaN(stat[1].percent) ? '--' :
                         /* eslint-disable-next-line react/style-prop-object */
                         <FormattedNumber style="percent" value={stat[1].percent / 100} />
                         })
                       </React.Fragment> :
                       <React.Fragment>
                        ({stat[1].count >= 0 ? stat[1].count : '--'}/{taskActions.total >= 0 ? taskActions.total : '--'})
                       </React.Fragment>
                      }
                    </span>
                  </span>
                </li>
              ))}
          </ul>
        ))}
      </div>
    )
  }

  generateProgressBar(taskActions, completionData, statusColors, orderedKeys) {
    return (
      <div className={classNames("challenge-task-progress", this.props.className)}>
        <ResponsiveBar data={[completionData]}
                      keys={orderedKeys}
                      indexBy="label"
                      minValue={0}
                      maxValue={100}
                      margin={{
                        top: 5,
                        right: 15,
                        bottom: 25,
                        left: 10,
                      }}
                      layout="horizontal"
                      colors={item => statusColors[item.id]}
                      borderColor="inherit:darker(1.6)"
                      enableGridY={false}
                      enableLabel={false}
                      enableAxisLeft={false}
                      animate={true}
                      motionStiffness={90}
                      motionDamping={15}
                      axisLeft={{tickCount: 0, tickValues: []}}
                      axisBottom={{format: v => `${v}%`, tickCount: 5}}
                      tooltip={(input) => <ProgressTooltip input={input} />}
                      theme={theme(this.props.lightMode)}
        />
        {taskActions.total > 0 && taskActions.available === 0 &&
         <SvgSymbol
           sym='check-icon'
           viewBox='0 0 20 20'
           className="challenge-task-progress__completed-indicator"
         />
        }
      </div>
    )
  }

  generateProgressBarLabel(taskActions) {
    if (taskActions.total > 0 && taskActions.available && taskActions.available !== 0)
      return (
        <p className="mr-my-4">
          <FormattedMessage
            {...messages.tasksRemaining}
            values={{taskCount: taskActions.available}}
          /><span className="mr-pr-1" />
          {/* eslint-disable-next-line react/style-prop-object */}
          (<FormattedNumber style="percent"
              value={taskActions.available/taskActions.total}
          />) <FormattedMessage
            {...messages.outOfTotal}
            values={{totalCount: taskActions.total}}
          />
        </p>
      )
    else {
      return null
    }
  }

  calculateChallengeStats(taskActions, orderedStatuses, localizedStatuses) {
    let challengeStats = {}
    _each(orderedStatuses, status => {
      challengeStats[localizedStatuses[keysByStatus[status]]] = {
        count: taskActions[keysByStatus[status]],
        percent: this.percent(taskActions[keysByStatus[status]], taskActions.total),
      }
    })

    return challengeStats
  }

  calculateCompletionData(taskActions, availableLabel, localizedStatuses) {
    const completionData = {
      "label": this.props.intl.formatMessage(messages.tooltipLabel),
      [availableLabel]: this.percent(taskActions.available, taskActions.total),
    }

    _each(orderedStatuses, status => {
      completionData[localizedStatuses[keysByStatus[status]]] =
        this.percent(taskActions[keysByStatus[status]], taskActions.total)
    })

    return completionData
  }

  render() {
    const taskActions = this.props.challenge?.actions || this.props.taskMetrics
    const taskPriorityActions = this.props.taskMetricsByPriority

    if (!_isObject(taskActions)) {
      return null
    }

    let calculatedSeconds = null
    let averageTime = null
    if (_get(taskActions, 'tasksWithTime', 0) > 0 &&
        _get(taskActions, 'totalTimeSpent', 0) > 0) {
      calculatedSeconds = taskActions.totalTimeSpent / taskActions.tasksWithTime / 1000
    }
    else if (_get(taskActions, 'avgTimeSpent', 0) > 0) {
      calculatedSeconds = taskActions.avgTimeSpent / 1000
    }

    if (calculatedSeconds) {
      averageTime =
        <div className="">
          <FormattedMessage {...messages.avgTimeSpent} />
          <span className="mr-pl-2">
            {Math.floor(calculatedSeconds / 60)}m {Math.floor(calculatedSeconds) % 60}s
          </span>
          {this.props.noteAvgExcludesSkip &&
            <span className="mr-pl-2">
              <FormattedMessage {...messages.excludesSkip} />
            </span>
          }
        </div>
    }

    const localizedStatuses = statusLabels(this.props.intl)
    const availableLabel = this.props.intl.formatMessage(messages.available)

    const statusColors = {
      [localizedStatuses.fixed]: TaskStatusColors[TaskStatus.fixed],
      [localizedStatuses.alreadyFixed]: TaskStatusColors[TaskStatus.alreadyFixed],
      [localizedStatuses.falsePositive]: TaskStatusColors[TaskStatus.falsePositive],
      [localizedStatuses.skipped]: TaskStatusColors[TaskStatus.skipped],
      [localizedStatuses.tooHard]: TaskStatusColors[TaskStatus.tooHard],
      [availableLabel]: 'rgba(0, 0, 0, .25)',
    }

    const orderedKeys = _map(orderedStatuses, status =>
      localizedStatuses[keysByStatus[status]]
    ).concat([availableLabel])

    const completionData = this.calculateCompletionData(taskActions, availableLabel, localizedStatuses)
    const challengeStats = this.calculateChallengeStats(taskActions, orderedStatuses, localizedStatuses)

    const prioritizedCompletionProgress = _map(TaskPriority, (priority) => {
      if (taskPriorityActions && taskPriorityActions[priority]) {
        const localizedPriorityLabels = taskPriorityLabels(this.props.intl)
        const pActions = taskPriorityActions[priority]

        const completionPriorityData = this.calculateCompletionData(pActions, availableLabel, localizedStatuses)
        const challengePriorityStats = this.calculateChallengeStats(pActions, orderedStatuses, localizedStatuses)

        return (
          <div className="mr-mt-6" key={priority}>
            <div
              className={classNames(
                "mr-text-md mr-font-medium mr-mb-4",
                this.props.lightMode ? "mr-text-matisse-blue" : "mr-text-yellow"
              )}
            >
              <FormattedMessage
                {...messages.priorityLabel}
                values={{priority: localizedPriorityLabels[keysByPriority[priority]]}}
              />
            </div>
            {this.generatePercentages(pActions, _chunk(Object.entries(challengePriorityStats), 3))}
            {this.generateProgressBar(pActions, completionPriorityData, statusColors, orderedKeys)}
            {this.generateProgressBarLabel(pActions)}
          </div>
        )
      }
    })

    return (
      <React.Fragment>
        {this.generatePercentages(taskActions, _chunk(Object.entries(challengeStats), 3))}
        {this.generateProgressBar(taskActions, completionData, statusColors, orderedKeys)}
        {this.generateProgressBarLabel(taskActions)}

        {averageTime}

        {taskPriorityActions && this.props.setShowByPriority &&
          <div
            className={classNames(
              "mr-cursor-pointer mr-flex mr-items-center mr-mt-4",
              this.props.lightMode ? "mr-text-green-light" : "mr-text-green-lighter"
            )}
            onClick={() => this.props.setShowByPriority(!this.props.showByPriority)}
          >
            <span className="mr-align-top">
              <FormattedMessage {...messages.byPriorityToggle} />
            </span>
            <span>
              <SvgSymbol
                sym="icon-cheveron-down"
                viewBox="0 0 20 20"
                className={classNames("mr-fill-current mr-w-5 mr-h-5 mr-transition",
                                      {"mr-expand-available": !this.props.showByPriority})}
              />
            </span>
          </div>
        }
        {this.props.showByPriority && prioritizedCompletionProgress}
      </React.Fragment>
    )
  }
}



ChallengeProgress.propTypes = {
  taskMetrics: PropTypes.object,
}

export default injectIntl(ChallengeProgress)
