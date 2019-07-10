import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import BurndownChart from '../../BurndownChart/BurndownChart'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import WithChallengeMetrics
       from '../../../HOCs/WithChallengeMetrics/WithChallengeMetrics'
import messages from './Messages'
import './BurndownChartWidget.scss'

const descriptor = {
  widgetKey: 'BurndownChartWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenges, WidgetDataTarget.challenge],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 12,
}

export default class BurndownChartWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="burndown-chart-widget"
        noMain
        widgetTitle={
          <FormattedMessage {...messages.title}
                            values={{taskCount: this.props.tasksAvailable}} />
        }
      >
        <BurndownChart {...this.props} className="mr-h-full" suppressHeading />
      </QuickWidget>
    )
  }
}

registerWidgetType(WithChallengeMetrics(BurndownChartWidget), descriptor)
