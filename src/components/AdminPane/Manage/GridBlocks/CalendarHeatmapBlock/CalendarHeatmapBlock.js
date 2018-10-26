import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import CalendarHeatmap from '../../CalendarHeatmap/CalendarHeatmap'
import PastDurationSelector
       from '../../../../PastDurationSelector/PastDurationSelector'
import QuickBlock from '../QuickBlock'
import messages from './Messages'
import './CalendarHeatmapBlock.css'

const descriptor = {
  blockKey: 'CalendarHeatmapBlock',
  label: messages.label,
  targets: [DashboardDataTarget.challenges, DashboardDataTarget.challenge],
  defaultWidth: 8,
  defaultHeight: 7,
  defaultConfiguration: {
    monthsPast: 12,
  },
}

export class CalendarHeatmapBlock extends Component {
  setMonthsPast = monthsPast => {
    if (this.props.blockConfiguration.monthsPast !== monthsPast) {
      this.props.updateBlockConfiguration({monthsPast})
    }
  }

  render() {
    const monthsPast = this.props.blockConfiguration.monthsPast || 12

    const selector =
      <PastDurationSelector pastMonthsOptions={[3, 6, 9, 12]}
                            currentMonthsPast={monthsPast}
                            selectDuration={this.setMonthsPast} />

    return (
      <QuickBlock {...this.props}
                  className={`calendar-heatmap-block months-${monthsPast}`}
                  headerControls={selector}
                  blockTitle={<FormattedMessage {...messages.title} />}>
        <CalendarHeatmap {...this.props} suppressHeading months={monthsPast} />
      </QuickBlock>
    )
  }
}

registerBlockType(CalendarHeatmapBlock, descriptor)
