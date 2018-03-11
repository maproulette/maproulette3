import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { ResponsiveRadar } from '@nivo/radar'
import { TaskStatus,
         keysByStatus,
         statusLabels } from '../../../services/Task/TaskStatus/TaskStatus'
import _map from 'lodash/map'

/**
 * Renders a radar chart displaying relative completion statuses of tasks.
 *
 * @see See http://recharts.org/#/en-US/examples/SimpleRadarChart
 */
export class CompletionChart extends Component {
  render() {
    const statusesToChart = [
      keysByStatus[TaskStatus.falsePositive],
      keysByStatus[TaskStatus.tooHard],
      keysByStatus[TaskStatus.skipped],
      keysByStatus[TaskStatus.alreadyFixed],
      keysByStatus[TaskStatus.fixed],
    ]

    const localizedLabels = statusLabels(this.props.intl)
    const metrics = _map(statusesToChart, status => ({
      status: localizedLabels[status],
      tasks: this.props.taskMetrics[status],
    }))

    return (
      <div className="completion-radar-chart">
        <ResponsiveRadar data={metrics}
                         colors={["#61CDBB"]}
                         keys={["tasks"]}
                         indexBy="status"
                         margin={{
                           "top": 40,
                           "right": 60,
                           "bottom": 40,
                           "left": 40,
                         }}
                         curve="catmullRomClosed"
                         borderWidth={0}
                         borderColor="inherit"
                         gridLevels={5}
                         gridShape="circular"
                         gridLabelOffset={16}
                         enableDots={true}
                         dotSize={8}
                         dotColor="inherit"
                         dotBorderWidth={0}
                         dotBorderColor="#ffffff"
                         enableDotLabel={true}
                         dotLabel="value"
                         dotLabelYOffset={20}
                         colorBy="key"
                         fillOpacity={0.2}
                         animate={true}
                         motionStiffness={90}
                         motionDamping={15}
                         isInteractive={true}
          />
      </div>
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

export default injectIntl(CompletionChart)
