import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import TaskTrackControls from '../../TaskPane/TaskTrackControls/TaskTrackControls'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskMoreOptionsWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 3,
  defaultHeight: 3,
}

export default class TaskMoreOptionsWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="task-more-options-widget"
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <TaskTrackControls {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(TaskMoreOptionsWidget, descriptor)
