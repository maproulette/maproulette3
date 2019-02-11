import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import Calendar from 'react-calendar-heatmap'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _reverse from 'lodash/reverse'
import format from 'date-fns/format'
import subMonths from 'date-fns/sub_months'
import messages from './Messages'
import './CalendarHeatmap.scss'

const COLOR_BUCKETS = 6 // total number of color buckets
const TOP_BUCKET_VALUE = 50 // value that gets into the top color bucket
const BUCKET_SIZE = TOP_BUCKET_VALUE / COLOR_BUCKETS

/**
 * CalendarHeatmap displays annual calendars with each day colored according to
 * the number of tasks marked with a status on that day. It makes use of the
 * react-calendar-heatmap package.
 *
 * > Note that color-bucket-* (e.g. color-bucket-0, color-bucket-1, etc) CSS
 * > classes must be setup for each color bucket.
 *
 * @see See https://github.com/patientslikeme/react-calendar-heatmap
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class CalendarHeatmap extends Component {
  colorBucketForCount = count =>
    Math.min(Math.floor(count / BUCKET_SIZE), COLOR_BUCKETS - 1)

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
        {!this.props.suppressHeading &&
         <p className="subheading">
           <FormattedMessage {...messages.heading} />
         </p>
        }
        <Calendar horizontal={!this.props.vertical}
                  startDate={subMonths(new Date(), this.props.months)}
                  endDate={new Date()}
                  values={calendarData}
                  classForValue={(value) => { // css class to assign
                    if (!value) {
                      return 'color-empty'
                    }

                    return `color-bucket-${this.colorBucketForCount(value.count)}`
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
  /** Number of months to display. Defaults to 12 */
  months: PropTypes.number,
  /** Set to true to render a vertical calendar */
  vertical: PropTypes.bool,
  /**
   * Set to true to use slightly different colors to help contrast from
   * similar background color.
   */
  highContrast: PropTypes.bool,
}

CalendarHeatmap.defaultProps = {
  months: 12,
  vertical: false,
  highContrast: false,
}
