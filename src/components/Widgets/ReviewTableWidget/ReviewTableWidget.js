import React, { Component } from 'react'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import TasksReviewTable from '../../../pages/Review/TasksReview/TasksReviewTable'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ReviewTableWidget',
  label: messages.label,
  targets: [WidgetDataTarget.review],
  minWidth: 10,
  defaultWidth: 10,
  minHeight: 6,
  defaultHeight: 18,
}

export default class ReviewTableWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="review-table-widget"
        noMain
      >
        <TasksReviewTable {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(ReviewTableWidget, descriptor)
