import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { map as _map,
         toPairs as _toPairs,
         groupBy as _groupBy,
         sumBy as _sumBy,
         get as _get,
         sortBy as _sortBy,
         isObject as _isObject,
         reverse as _reverse } from 'lodash'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { parse } from 'date-fns'
import { TaskStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'

export class BurndownChart extends Component {
  render() {
    if (!_isObject(this.props.actions)) {
      return null
    }

    let totalRemaining = this.props.actions.available

    // Work our way backwards in time.
    let sortedActivity =
      _reverse(_sortBy(_get(this.props, 'activity', []), 'date'))
    const groupedByDate =
      _toPairs(_groupBy(sortedActivity, 'date'))

    const dailyMetrics = _map(groupedByDate, dailyEntries => {
      const metrics = {
        dateString: this.props.intl.formatDate(
                      parse(dailyEntries[0]),
                      {day: '2-digit', month: 'short'}
                    ),
        remaining: totalRemaining,
      }

      metrics.completed = _sumBy(dailyEntries[1], entry =>
        entry.status === TaskStatus.fixed ||
        entry.status === TaskStatus.falsePositive ? entry.count : 0
      )

      totalRemaining += metrics.completed
      return metrics
    })

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
  actions: PropTypes.object,
  activity: PropTypes.array,
}

BurndownChart.defaultProps = {
  width: 320,
  height: 200,
  strokeColor: "#00A592",
  fillColor: "#A4DBD5",
}

export default injectIntl(BurndownChart)
