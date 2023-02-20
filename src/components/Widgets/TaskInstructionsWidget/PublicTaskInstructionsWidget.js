import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  WidgetDataTarget,
  registerWidgetType,
} from '../../../services/Widget/Widget'
import TaskInstructions from '../../TaskPane/TaskInstructions/TaskInstructions'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'PublicTaskInstructionsWidget',
  label: messages.publicLabel,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 2,
  defaultHeight: 6,
}

export default class PublicTaskInstructionsWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className='task-instructions-widget'
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <TaskInstructions {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(PublicTaskInstructionsWidget, descriptor)
