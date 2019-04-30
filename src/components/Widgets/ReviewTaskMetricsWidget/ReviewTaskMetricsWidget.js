import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import ReviewTaskMetrics from '../../../pages/Review/Metrics/ReviewTaskMetrics'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ReviewTaskMetricsWidget',
  label: messages.label,
  targets: [WidgetDataTarget.review],
  minWidth: 2,
  defaultWidth: 4,
  minHeight: 4,
  defaultHeight: 6,
}

export default class ReviewTaskMetricsWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="review-task-metrics-widget"
        widgetTitle={
          <FormattedMessage {...messages.title} />
        }
        noMain
      >
        <ReviewTaskMetrics {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(ReviewTaskMetricsWidget, descriptor)
