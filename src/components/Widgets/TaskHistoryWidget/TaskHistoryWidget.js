import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import TaskHistoryList from '../../TaskHistoryList/TaskHistoryList'
import WithTaskHistory from '../../HOCs/WithTaskHistory/WithTaskHistory'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskHistoryWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 3,
  defaultHeight: 6,
}

export default class TaskHistoryWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="task-history-widget"
        widgetTitle={<FormattedMessage {...messages.title} />}
       >
        <TaskHistoryList
          className="mr-px-4"
          taskHistory={this.props.task.history}
        />
      </QuickWidget>
    )
  }
}

TaskHistoryWidget.propTypes = {
}

registerWidgetType(WithTaskHistory(TaskHistoryWidget), descriptor)
