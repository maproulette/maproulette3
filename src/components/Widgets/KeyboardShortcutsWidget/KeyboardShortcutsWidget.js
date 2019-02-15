import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import KeyboardShortcutList
       from '../../TaskPane/ActiveTaskDetails/KeyboardShortcutReference/KeyboardShortcutList'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'KeyboardShortcutsWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 3,
  defaultHeight: 7,
}

export default class KeyboardShortcutsWidget extends Component {
  render() {
    return (
      <QuickWidget {...this.props}
                  className="keyboard-shortcuts-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}>
        <KeyboardShortcutList {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(KeyboardShortcutsWidget, descriptor)
