import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import TaskStatusIndicator
       from '../../TaskStatusIndicator/TaskStatusIndicator'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskStatusWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 2,
  defaultWidth: 3,
  minHeight: 2,
  defaultHeight: 4,
}

export default class TaskStatusWidget extends Component {
  render() {
    return (
      <QuickWidget {...this.props} className="task-status-widget"
                   widgetTitle={<FormattedMessage {...messages.title} />}>
        <TaskStatusIndicator showAnyStatus={true} {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(TaskStatusWidget, descriptor)
