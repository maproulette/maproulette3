import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import OSMElementHistory from '../../OSMElementHistory/OSMElementHistory'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'OSMHistoryWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 3,
  defaultHeight: 6,
}

export default class OSMHistoryWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <OSMElementHistory {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(OSMHistoryWidget, descriptor)
