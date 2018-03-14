import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { ResponsiveCalendar } from '@nivo/calendar'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _reverse from 'lodash/reverse'
import format from 'date-fns/format'
import messages from './Messages'

/**
 * CalendarHeatmap displays annual calendars with each day colored according to
 * the number of tasks marked with a status on that day.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class CalendarHeatmap extends Component {
  render() {
    if (this.props.dailyMetrics.length === 0) {
      return null
    }

    const calendarData =
      _compact(_map(_reverse(this.props.dailyMetrics), metrics =>
        metrics.value === 0 ? null :
        ({
          day: format(metrics.day, 'YYYY-MM-DD'),
          value: metrics.value,
        })
    ))

    return (
      <div className="calendar-heatmap">
        <p className="subheading">
          <FormattedMessage {...messages.heading} />
        </p>
        <ResponsiveCalendar data={calendarData}
                            from={calendarData[0].day}
                            to={calendarData[calendarData.length - 1].day}
                            emptyColor="#F6F6F6"
                            domain={[0, 50]}
                            direction="vertical"
                            colors={[
                              "#e0f5f2",
                              "#61cdbb",
                              "#e8c1a0",
                              "#f1e15b",
                              "#e8a838",
                              "#f47560"
                            ]}
                            margin={{
                                "top": 40,
                                "right": 30,
                                "bottom": 50,
                                "left": 30
                            }}
                            yearSpacing={40}
                            monthBorderColor="#ffffff"
                            monthLegendOffset={10}
                            dayBorderWidth={2}
                            dayBorderColor="#ffffff"
                            legends={[
                                {
                                    "anchor": "bottom-left",
                                    "direction": "row",
                                    "translateY": 50,
                                    "itemCount": 6,
                                    "itemWidth": 34,
                                    "itemHeight": 36,
                                    "itemDirection": "top-to-bottom"
                                }
                            ]}
        />
      </div>
    )
  }
}

CalendarHeatmap.propTypes = {
  /** Daily activity metrics to use for charting */
  dailyMetrics: PropTypes.array,
}
