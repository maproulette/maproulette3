import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import WithCurrentUser from '../../HOCs/WithCurrentUser/WithCurrentUser'
import WithEditor from '../../HOCs/WithEditor/WithEditor'
import ActiveTaskControls
       from '../../TaskPane/ActiveTaskDetails/ActiveTaskControls/ActiveTaskControls'
import InspectTaskControls from '../../InspectTaskControls/InspectTaskControls'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskCompletionWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 3,
  defaultHeight: 12,
}

export default class TaskCompletionWidget extends Component {
  render() {
    const taskControls =
      this.props.inspectTask ?
      <InspectTaskControls {...this.props} className="mr-px-4" /> :
      <ActiveTaskControls {...this.props} className="mr-px-0" />

    return (
      <QuickWidget
        {...this.props}
        className="task-controls-widget"
        widgetTitle={
          this.props.inspectTask ?
          <FormattedMessage {...messages.inspectTitle} /> :
          <FormattedMessage {...messages.title} />
        }
        noMain
        permanent
      >
        {taskControls}
      </QuickWidget>
    )
  }
}

registerWidgetType(WithCurrentUser(WithEditor(TaskCompletionWidget)), descriptor)
