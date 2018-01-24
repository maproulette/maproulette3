import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Radar,
         RadarChart,
         PolarGrid,
         PolarAngleAxis,
         PolarRadiusAxis } from 'recharts'
import { map as _map,
         pick as _pick,
         isNumber as _isNumber,
         compact as _compact,
         startCase as _startCase } from 'lodash'

/**
 * Renders a radar chart displaying relative completion statuses
 * of tasks.
 *
 * @see See http://recharts.org/#/en-US/examples/SimpleRadarChart
 */
export default class CompletionChart extends Component {
  render() {
    const completionStatusMetrics = 
      _pick(this.props.taskMetrics,
            ['fixed', 'falsePositive', 'alreadyFixed', 'skipped', 'tooHard'])

    const chartData = _compact(
      _map(completionStatusMetrics, (value, label) => {
        if (!_isNumber(value)) {
          return null
        }

        return {
          metric: _startCase(label), value, fullMark: this.props.taskMetrics.total
        }
      })
    )

    return (
      <RadarChart cx={this.props.centerX}
                  cy={this.props.centerY}
                  outerRadius={this.props.outerRadius}
                  width={this.props.width}
                  height={this.props.height}
                  data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="metric" />
        <PolarRadiusAxis stroke={this.props.axisLabelColor} />
        <Radar name="Tasks"
          dataKey="value"
          stroke={this.props.strokeColor}
          fill={this.props.fillColor}
          fillOpacity={this.props.fillOpacity}/>
      </RadarChart>
    )
  }
}

CompletionChart.propTypes = {
  taskMetrics: PropTypes.object.isRequired,
  width: PropTypes.number,
  /** The x-coordinate of center of chart */
  centerX: PropTypes.number,
  /** The y-coordinate of center of chart */
  centerY: PropTypes.number,
  /** The radius of the outer polar grid */
  outerRadius: PropTypes.number,
  /** Color of border around filled area */
  strokeColor: PropTypes.string,
  /** Background color of filled area */
  fillColor: PropTypes.string,
  /** Opacity filled area */
  fillOpacity: PropTypes.number,
  /** Color of axis value labels */
  axisLabelColor: PropTypes.string,
}

CompletionChart.defaultProps = {
  width: 525,
  height: 425,
  cx: 225,
  cy: 180,
  outerRadius: 150,
  strokeColor: "#00A592",
  fillColor: "#A4DBD5",
  fillOpacity: 0.6,
  axisLabelColor: "#606060",
}
