import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import _map from 'lodash/map'
import _toPairs from 'lodash/toPairs'
import _groupBy from 'lodash/groupBy'
import _sumBy from 'lodash/sumBy'
import _flatten from 'lodash/flatten'
import _compact from 'lodash/compact'
import _isEmpty from 'lodash/isEmpty'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { parse } from 'date-fns'
import { TaskStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'

/**
 * BurndownChart displays a basic chart showing progress towards challenge
 * completion over time for one or more challenges.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class BurndownChart extends Component {
  render() {
    if (_isEmpty(this.props.challenges)) {
      return null
    }

    let totalRemaining = _sumBy(this.props.challenges, 'actions.available')
    let allActivity = _compact(_flatten(_map(this.props.challenges, 'activity')))

    // Work our way backwards in time, sorting by date descending.
    let sortedActivity = _reverse(_sortBy(allActivity, 'date'))

    // Group activity entries by day
    const groupedByDate = _toPairs(_groupBy(sortedActivity, 'date'))

    // Calculate metrics for each day
    const dailyMetrics = _map(groupedByDate, dailyEntries => {
      const day = dailyEntries[0]
      const dayActivity = dailyEntries[1]

      const metrics = {
        dateString: this.props.intl.formatDate(
                      parse(day),
                      {day: '2-digit', month: 'short'}
                    ),
        remaining: totalRemaining,
      }

      metrics.completed = _sumBy(dayActivity, entry =>
        entry.status !== TaskStatus.created ? entry.count : 0
      )

      // We add to totalRemaining because we're going backwards through time,
      // so the prior day had more remaining tasks than the current day.
      totalRemaining += metrics.completed
      return metrics
    })

    // While we calculated going backwards in time, we display going forwards.
    return (
      <div className="burndown-chart">
        <AreaChart width={this.props.width}
                   height={this.props.height}
                   data={_reverse(dailyMetrics)}>
          <XAxis dataKey="dateString" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3"/>
          <Tooltip />
          <Area type="monotone"
                dataKey="remaining"
                stroke={this.props.strokeColor}
                fill={this.props.fillColor} />
        </AreaChart>
      </div>
    )
  }
}

BurndownChart.propTypes = {
  /** The challenges for which to chart combined activity */
  challenges: PropTypes.array.isRequired,
}

BurndownChart.defaultProps = {
  width: 320,
  height: 200,
  strokeColor: "#00A592",
  fillColor: "#A4DBD5",
}

export default injectIntl(BurndownChart)
