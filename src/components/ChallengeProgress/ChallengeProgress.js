import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import _isObject from 'lodash/isObject'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _each from 'lodash/each'
import _isEqual from 'lodash/isEqual'
import { TaskStatus, keysByStatus, statusLabels }
       from '../../services/Task/TaskStatus/TaskStatus'
import { ResponsiveBar } from '@nivo/bar'
import messages from './Messages'
import './ChallengeProgress.css'

export class ChallengeProgress extends Component {
  percent = (value, total) => Math.round(value / total * 100)

  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render if the challenge or actions changed
    if (_get(nextProps, 'challenge.id') !== _get(this.props, 'challenge.id')) {
      return true
    }

    if (!_isEqual(nextProps.challenge.actions, this.props.challenge.actions)) {
      return true
    }

    return false
  }

  render() {
    const localizedStatuses = statusLabels(this.props.intl)
    const taskActions = _get(this.props, 'challenge.actions')
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
      [availableLabel]: '#CCCCCC'
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

    return (
      <div className="challenge-task-progress">
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
        />
      </div>
    )
  }
}

ChallengeProgress.propTypes = {
  challenge: PropTypes.object,
}

export default injectIntl(ChallengeProgress)
