import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import WithCurrentUser from '../../HOCs/WithCurrentUser/WithCurrentUser'
import ReviewTaskControls from '../../ReviewTaskControls/ReviewTaskControls'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskReviewWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 3,
  defaultHeight: 12,
}

export default class TaskReviewWidget extends Component {
  render() {
    const taskControls = <ReviewTaskControls {...this.props} className="mr-px-4" />

    return (
      <QuickWidget
        {...this.props}
        className="task-controls-widget"
        widgetTitle={
          <FormattedMessage {...messages.reviewTaskTitle} />
        }
        noMain
      >
        {taskControls}
      </QuickWidget>
    )
  }
}

registerWidgetType(WithCurrentUser(TaskReviewWidget), descriptor)
