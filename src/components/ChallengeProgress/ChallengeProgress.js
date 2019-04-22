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
import { TaskStatus, keysByStatus, statusLabels }
       from '../../services/Task/TaskStatus/TaskStatus'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './ChallengeProgress.scss'
import { colors } from '../../tailwind'

const theme = {
  // background: "#222222",
  axis: {
    fontSize: ".75rem",
    tickColor: colors.white,
    ticks: {
      line: {
        stroke: colors.white
      },
      text: {
        fill: colors.white
      }
    },
    legend: {
      text: {
        fill: colors.white
      }
    }
  },
  grid: {
    line: {
      stroke: "#555555"
    }
  },
  tooltip: {container: {color: colors.black, background: colors.white}}
};

export class ChallengeProgress extends Component {
  percent = (value, total) => Math.round(value / total * 100)

  shouldComponentUpdate(nextProps, nextState) {
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

    return false
  }

  render() {
    const localizedStatuses = statusLabels(this.props.intl)
    const taskActions = this.props.taskMetrics ?
                        this.props.taskMetrics :
                        _get(this.props, 'challenge.actions')

    if (!_isObject(taskActions)) {
      return null
    }

    const availableLabel = this.props.intl.formatMessage(messages.available)

    const statusColors = {
      [localizedStatuses.fixed]: '#61CDBB',
      [localizedStatuses.alreadyFixed]: '#97E3D5',
      [localizedStatuses.falsePositive]: '#F1E15B',
      [localizedStatuses.skipped]: '#E8A838',
      [localizedStatuses.tooHard]: '#F47560',
      [availableLabel]: 'rgba(0, 0, 0, .25)'
    }

    const completionData = {
      "label": this.props.intl.formatMessage(messages.tooltipLabel),
      [availableLabel]: this.percent(taskActions.available, taskActions.total),
    }

    const orderedStatuses = [
      TaskStatus.fixed,
      TaskStatus.alreadyFixed,
      TaskStatus.falsePositive,
      TaskStatus.skipped,
      TaskStatus.tooHard,
      // No 'available' here: we'll append that to the orderedKeys below.
    ]

    _each(orderedStatuses, status => {
      completionData[localizedStatuses[keysByStatus[status]]] =
        this.percent(taskActions[keysByStatus[status]], taskActions.total)
    })

    const orderedKeys = _map(orderedStatuses, status =>
      localizedStatuses[keysByStatus[status]]
    ).concat([availableLabel])

    let challengeStats = {}

    _each(orderedStatuses, status => {
      challengeStats[localizedStatuses[keysByStatus[status]]] =
        this.percent(taskActions[keysByStatus[status]], taskActions.total)
    })

    const challengeStatsColumns = _chunk(Object.entries(challengeStats), 3)

    return (
      <React.Fragment>
        <div className="mr-text-sm mr-grid mr-grid-columns-2 mr-grid-gap-4">
          {_map(challengeStatsColumns, stats => (
            <ul>
                {_map(stats, stat => (  
                  <li class="mr-flex mr-items-center">
                    <span className="mr-text-lg mr-text-yellow">
                      {/* eslint-disable-next-line react/style-prop-object */}
                      <FormattedNumber style="percent" value={stat[1] / 100} /> 
                    </span>
                    <span className="mr-ml-2 mr-uppercase">
                      {stat[0]}{' '}
                      <span className="mr-text-xs">
                        ({stat[1]}/{taskActions.total})
                      </span>
                    </span>
                  </li>
                ))}
            </ul>
          ))}
        </div>
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
                          left: 7,
                        }}
                        layout="horizontal"
                        colorBy={item => statusColors[item.id]}
                        borderColor="inherit:darker(1.6)"
                        enableGridY={false}
                        enableLabel={false}
                        enableAxisLeft={false}
                        animate={true}
                        motionStiffness={90}
                        motionDamping={15}
                        axisLeft={{tickCount: 0, tickValues: []}}
                        axisBottom={{format: v => `${v}%`, tickCount: 5}}
                        tooltipFormat={v => `${v}%`}
                        theme={theme}
          />
          {taskActions.total > 0 && taskActions.available === 0 &&
            <SvgSymbol sym='check-icon' viewBox='0 0 20 20'
                      className="challenge-task-progress__completed-indicator" />
          }        
        </div>
        {taskActions.total > 0 && taskActions.available !== 0 &&
          <p className="mr-my-4">
            <FormattedMessage
              {...messages.tasksRemaining}
              values={{taskCount: taskActions.available}}
            />
            {/* eslint-disable-next-line react/style-prop-object */}
            (<FormattedNumber style="percent"
                value={taskActions.available/taskActions.total}
            />) <FormattedMessage
              {...messages.outOfTotal}
              values={{totalCount: taskActions.total}}
            />
          </p>
        }
      </React.Fragment>
    )
  }
}

ChallengeProgress.propTypes = {
  challenge: PropTypes.object,
}

export default injectIntl(ChallengeProgress)
