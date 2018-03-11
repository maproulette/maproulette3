import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedNumber, injectIntl } from 'react-intl'
import { ResponsiveLine } from '@nivo/line'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _filter from 'lodash/filter'
import _toPairs from 'lodash/toPairs'
import _groupBy from 'lodash/groupBy'
import _sumBy from 'lodash/sumBy'
import _flatten from 'lodash/flatten'
import _compact from 'lodash/compact'
import _isEmpty from 'lodash/isEmpty'
import _isArray from 'lodash/isArray'
import _isFinite from 'lodash/isFinite'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import parse from 'date-fns/parse'
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

    const tasksAvailable = _sumBy(this.props.challenges, 'actions.available')
    if (!_isFinite(tasksAvailable)) {
      return null
    }

    let allActivity = _isArray(this.props.activity) ? this.props.activity :
                      _compact(_flatten(_map(this.props.challenges, 'activity')))

    // Work our way backwards in time, sorting by date descending.
    let sortedActivity = _reverse(_sortBy(allActivity, 'date'))

    // Group activity entries by day
    const groupedByDate = _toPairs(_groupBy(sortedActivity, 'date'))

    // Calculate metrics for each day
    let totalRemaining = tasksAvailable
    const dailyMetrics = _map(groupedByDate, dailyEntries => {
      const day = parse(dailyEntries[0])
      const dayActivity = dailyEntries[1]

      const metrics = {
        day,
        x: this.props.intl.formatDate(
                      day,
                      {day: '2-digit', month: 'short'}
                    ),
        y: totalRemaining,
      }

      // We add to totalRemaining because we're going backwards through time,
      // so the prior day had more remaining tasks than the current day.
      const completedToday = _sumBy(dayActivity, entry =>
        entry.status !== TaskStatus.created ? entry.count : 0
      )

      totalRemaining += completedToday
      return metrics
    })

    if (dailyMetrics.length === 0) {
      return null
    }

    const latestDayOfWeek = dailyMetrics[0].day.getUTCDay()
    const weeklyMetrics =
      _filter(dailyMetrics, metrics => metrics.day.getUTCDay() === latestDayOfWeek)

    // While we calculated going backwards in time, we display going forwards.
    const burndownMetrics = [{
        id: _get(this.props, "chartTitle", ""),
        data: _reverse(weeklyMetrics),
    }]

    return (
      <div className="burndown-chart">
        {!_isEmpty(this.props.chartTitle) &&
         <p className="subheading">
           {this.props.chartTitle} <FormattedNumber value={tasksAvailable} />
         </p>
        }
        <ResponsiveLine data={burndownMetrics}
                        colors={["#61CDBB"]}
                        margin={{
                            "top": 50,
                            "right": 20,
                            "bottom": 60,
                            "left": 50
                        }}
                        minY={0}
                        lineWidth={0}
                        stacked={false}
                        axisBottom={{
                            "orient": "bottom",
                            "tickSize": 5,
                            "tickPadding": 5,
                            "tickRotation": -90,
                        }}
                        axisLeft={{
                            "orient": "left",
                            "tickSize": 10,
                            "tickPadding": 10,
                            "tickRotation": 0,
                        }}
                        enableArea={true}
                        enableDots={true}
                        dotSize={10}
                        dotColor="inherit"
                        dotBorderWidth={2}
                        dotBorderColor="#ffffff"
                        enableDotLabel={true}
                        dotLabel="y"
                        dotLabelYOffset={-12}
                        enableGridX={false}
                        enableGridY={false}
                        animate={true}
                        curve="monotoneX"
                        motionStiffness={90}
                        motionDamping={15}
        />
      </div>
    )
  }
}

BurndownChart.propTypes = {
  /** The challenges for which to chart combined activity */
  challenges: PropTypes.array.isRequired,
  /** Activity to use. Will be pulled from challenges if not given. */
  activity: PropTypes.array,
}

BurndownChart.defaultProps = {
  width: 320,
  height: 200,
  strokeColor: "#00A592",
  fillColor: "#A4DBD5",
}

export default injectIntl(BurndownChart)
