import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import PropertyList from '../../EnhancedMap/PropertyList/PropertyList'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskPropertiesWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 4,
  defaultHeight: 6,
}

export default class TaskPropertiesWidget extends Component {
  render() {
    const properties = AsMappableTask(this.props.task).allFeatureProperties()

    return (
      <QuickWidget
        {...this.props}
        className="task-properties-widget"
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <PropertyList featureProperties={properties} hideHeader lightMode={false} {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(TaskPropertiesWidget, descriptor)
