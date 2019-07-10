import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import CompletionRadar from '../../CompletionRadar/CompletionRadar'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import WithChallengeMetrics
       from '../../../HOCs/WithChallengeMetrics/WithChallengeMetrics'
import messages from './Messages'
import './StatusRadarWidget.scss'

const descriptor = {
  widgetKey: 'StatusRadarWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenges, WidgetDataTarget.challenge],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 12,
}

export default class StatusRadarWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="status-radar-widget"
        noMain
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <CompletionRadar {...this.props} className="mr-h-full" suppressHeading />
      </QuickWidget>
    )
  }
}

registerWidgetType(WithChallengeMetrics(StatusRadarWidget), descriptor)
