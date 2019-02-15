import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import { ResponsiveLine } from '@nivo/line'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import _reverse from 'lodash/reverse'
import messages from './Messages'

/**
 * BurndownChart displays a basic chart showing progress towards challenge
 * completion over time for one or more challenges.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class BurndownChart extends Component {
  /**
   * Includes the first and last datapoint, plus evenly-distributed samples
   * from the remainder of the given data points.
   */
  distributedDataSamples(dataPoints, totalSamplesDesired) {
    if (totalSamplesDesired >= dataPoints.length) {
      return dataPoints
    }

    const samples = []
    const sampleInterval = dataPoints.length / (totalSamplesDesired - 2)

    samples.push(dataPoints[0])
    for (let i = 1; i < totalSamplesDesired - 1; i++) {
      const sampleIndex = Math.floor(i * sampleInterval)

      // Don't add first or last element since we handle those separately
      if (sampleIndex > 0 && sampleIndex < dataPoints.length - 1) {
        samples.push(dataPoints[sampleIndex])
      }
    }
    samples.push(dataPoints[dataPoints.length - 1])

    return samples
  }

  render() {
    if (this.props.dailyMetrics.length === 0) {
      return null
    }

    const latestDayOfWeek = this.props.dailyMetrics[0].day.getUTCDay()
    const weeklyMetrics =
      _filter(this.props.dailyMetrics,
              metrics => metrics.day.getUTCDay() === latestDayOfWeek)

    // While we calculated going backwards in time, we display going forwards.
    const burndownMetrics = [{
        id: this.props.intl.formatMessage(messages.tooltip),
        data: _reverse(weeklyMetrics),
    }]

    const distributedLabels =
      _map(this.distributedDataSamples(burndownMetrics[0].data, 12), 'x')

    return (
      <div className={classNames("burndown-chart", this.props.className)}>
        {!this.props.suppressHeading &&
         <p className="subheading">
           <FormattedMessage {...messages.heading}
                             values={{taskCount: this.props.tasksAvailable}} />
         </p>
        }
        <ResponsiveLine data={burndownMetrics}
                        colors={["#61CDBB"]}
                        margin={{
                          top: 20,
                          right: 20,
                          bottom: 85,
                          left: 63,
                        }}
                        minY={0}
                        lineWidth={0}
                        stacked={false}
                        axisBottom={{
                          orient: "bottom",
                          tickSize: 10,
                          tickPadding: 5,
                          tickRotation: -45,
                          tickValues: distributedLabels,
                        }}
                        axisLeft={{
                          orient: "left",
                          tickSize: 10,
                          tickPadding: 10,
                          tickRotation: 0,
                        }}
                        enableArea={true}
                        enableDots={false}
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
  /** The challenges for which to chart remaining tasks */
  challenges: PropTypes.array.isRequired,
  /** Daily activity metrics to use for charting */
  dailyMetrics: PropTypes.array,
  /** Total number of currently remaining tasks */
  tasksAvailable: PropTypes.number,
}

export default injectIntl(BurndownChart)
