import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import { ResponsiveRadar } from '@nivo/radar'
import { TaskStatus,
         keysByStatus,
         statusLabels }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import _map from 'lodash/map'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../../tailwind.config.js'
import messages from './Messages'

const colors = resolveConfig(tailwindConfig).theme.colors

/**
 * Renders a radar chart displaying relative completion statuses of tasks.
 */
export class CompletionRadar extends Component {
  render() {
    const statusesToChart = [
      keysByStatus[TaskStatus.falsePositive],
      keysByStatus[TaskStatus.tooHard],
      keysByStatus[TaskStatus.skipped],
      keysByStatus[TaskStatus.alreadyFixed],
      keysByStatus[TaskStatus.fixed],
    ]

    const localizedLabels = statusLabels(this.props.intl)

    let totalEvaluated = 0
    const metrics = _map(statusesToChart, status => {
      totalEvaluated += this.props.taskMetrics[status] || 0

      return {
        status: localizedLabels[status],
        tasks: this.props.taskMetrics[status] || 0,
      }
    })

    return (
      <div className={classNames("completion-radar-chart", this.props.className)}>
        {!this.props.suppressHeading &&
         <p className="subheading">
           <FormattedMessage {...messages.heading}
                             values={{taskCount: totalEvaluated}} />
         </p>
        }
        <ResponsiveRadar
          data={metrics}
          theme={{
            textColor: '#FFF',
            tooltip: {
              container: {
                background: colors["blue-darker"],
                color: '#FFF',
              }
            },
          }}
          colors={[colors["blue-dark"]]}
          keys={["tasks"]}
          indexBy="status"
          margin={{
            top: 40,
            right: 60,
            bottom: 40,
            left: 40,
          }}
          curve="catmullRomClosed"
          borderWidth={0}
          borderColor="inherit"
          gridLevels={5}
          gridShape="circular"
          gridLabelOffset={16}
          enableDots={true}
          dotSize={8}
          dotColor="#000"
          dotBorderWidth={2}
          dotBorderColor={colors["pink"]}
          enableDotLabel={true}
          dotLabel="value"
          dotLabelYOffset={20}
          colorBy="key"
          fillOpacity={0.4}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          isInteractive={true}
        />
      </div>
    )
  }
}

CompletionRadar.propTypes = {
  taskMetrics: PropTypes.object.isRequired,
  suppressHeading: PropTypes.bool,
}

export default injectIntl(CompletionRadar)
