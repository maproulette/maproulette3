import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import OSMElementData from '../../OSMElementData/OSMElementData'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'OSMDataWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 3,
  defaultHeight: 6,
}

export default class OSMDataWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <OSMElementData {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(OSMDataWidget, descriptor)
