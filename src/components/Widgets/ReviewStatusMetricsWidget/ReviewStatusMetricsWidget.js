import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import ReviewStatusMetrics from '../../../pages/Review/Metrics/ReviewStatusMetrics'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ReviewStatusMetricsWidget',
  label: messages.label,
  targets: [WidgetDataTarget.review, WidgetDataTarget.challenge, 
            WidgetDataTarget.challenges],
  minWidth: 2,
  defaultWidth: 4,
  minHeight: 4,
  defaultHeight: 6,
}

export default class ReviewStatusMetricsWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="review-status-metrics-widget"
        widgetTitle={
          <FormattedMessage {...messages.title} />
        }
        noMain
      >
        <ReviewStatusMetrics {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(ReviewStatusMetricsWidget, descriptor)
