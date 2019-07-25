import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import CalendarHeatmap from '../../CalendarHeatmap/CalendarHeatmap'
import PastDurationSelector
       from '../../../../PastDurationSelector/PastDurationSelector'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import WithChallengeMetrics
       from '../../../HOCs/WithChallengeMetrics/WithChallengeMetrics'
import messages from './Messages'
import './CalendarHeatmapWidget.scss'

const descriptor = {
  widgetKey: 'CalendarHeatmapWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenge],
  defaultWidth: 8,
  defaultHeight: 7,
  minWidth: 5,
  defaultConfiguration: {
    monthsPast: 12,
  },
}

export default class CalendarHeatmapWidget extends Component {
  setMonthsPast = monthsPast => {
    if (this.props.widgetConfiguration.monthsPast !== monthsPast) {
      this.props.updateWidgetConfiguration({monthsPast})
    }
  }

  render() {
    const monthsPast = this.props.widgetConfiguration.monthsPast || 12

    const selector =
      <PastDurationSelector
        className="mr-button mr-button--blue mr-mr-8"
        pastMonthsOptions={[3, 6, 9, 12]}
        currentMonthsPast={monthsPast}
        selectDuration={this.setMonthsPast}
      />

    return (
      <QuickWidget {...this.props}
                  className={`calendar-heatmap-widget months-${monthsPast}`}
                  headerControls={selector}
                  widgetTitle={<FormattedMessage {...messages.title} />}>
        <CalendarHeatmap {...this.props} suppressHeading months={monthsPast} />
      </QuickWidget>
    )
  }
}

registerWidgetType(WithChallengeMetrics(CalendarHeatmapWidget), descriptor)
