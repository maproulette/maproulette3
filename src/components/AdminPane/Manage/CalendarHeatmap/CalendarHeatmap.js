import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import Calendar from 'react-calendar-heatmap'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _reverse from 'lodash/reverse'
import format from 'date-fns/format'
import subYears from 'date-fns/sub_years'
import messages from './Messages'
import './CalendarHeatmap.css'

const COLOR_BUCKETS = 6
const TOP_BUCKET_VALUE = 50 // value that gets into the top color bucket
const BUCKET_SIZE = TOP_BUCKET_VALUE / COLOR_BUCKETS

/**
 * CalendarHeatmap displays annual calendars with each day colored according to
 * the number of tasks marked with a status on that day.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class CalendarHeatmap extends Component {
  render() {
    const calendarData =
      _compact(_map(_reverse(this.props.dailyMetrics), metrics =>
        metrics.value === 0 ? null :
        ({
          date: format(metrics.day, 'YYYY-MM-DD'),
          count: metrics.value,
        })
    ))

    if (calendarData.length === 0) {
      return null
    }

    return (
      <div className={classNames("calendar-heatmap",
                                 {vertical: this.props.vertical,
                                  "high-contrast": this.props.highContrast})}>
        <p className="subheading">
          <FormattedMessage {...messages.heading} />
        </p>
        <Calendar horizontal={this.props.vertical ? false : true}
                  startDate={subYears(new Date(), 1)}
                  endDate={new Date()}
                  values={calendarData}
                  classForValue={(value) => {
                    if (!value) {
                      return 'color-empty'
                    }

                    const colorBucket =
                      Math.min(Math.floor(value.count / BUCKET_SIZE), COLOR_BUCKETS - 1)

                    return `color-bucket-${colorBucket}`
                  }}
                  titleForValue={(value) => value ? `${value.date}: ${value.count}` : ''}
        />
      </div>
    )
  }
}

CalendarHeatmap.propTypes = {
  /** Daily activity metrics to use for charting */
  dailyMetrics: PropTypes.array,
}
