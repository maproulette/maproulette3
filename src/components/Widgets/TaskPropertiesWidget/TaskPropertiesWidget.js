import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
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
    const taskList = _get(this.props.taskBundle, 'tasks') || [this.props.task]
    const propertyLists = _map(taskList, (task) => {
      const featurePropertiesList = AsMappableTask(task).osmFeatureProperties(this.props.osmElements)

      return (
        <div key={task.id} className="mr-mb-6">
          <div className="mr-text-yellow">
            <FormattedMessage {...messages.taskLabel} values={{taskId: task.id}}/>
          </div>
          {
            featurePropertiesList.map((feature, index) => {
              return (
                <div key={index}>
                  <div className="mr-text-yellow mr-ml-2">
                    {feature.properties?.id || feature.geometry?.type}
                  </div>
                  <PropertyList featureProperties={feature.properties} hideHeader
                    lightMode={false} {...this.props} />
                </div>
              )
            })
          }
        </div>
      )
    })


    return (
      <QuickWidget
        {...this.props}
        className="task-properties-widget"
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        {propertyLists}
      </QuickWidget>
    )
  }
}

registerWidgetType(TaskPropertiesWidget, descriptor)
