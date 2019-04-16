import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import TaskLocationMap from '../../TaskPane/TaskLocationMap/TaskLocationMap'
import PlaceDescription from '../../TaskPane/PlaceDescription/PlaceDescription'
import TaskLatLon from '../../TaskPane/TaskLatLon/TaskLatLon'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'
import './TaskLocationWidget.scss'

const descriptor = {
  widgetKey: 'TaskLocationWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 6,
  defaultHeight: 8,
}

export default class TaskLocationWidget extends Component {
  render() {
    return (
      <QuickWidget {...this.props}
                  className="task-location-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}>
        <div className="task-location-widget__inset-map">
          <TaskLocationMap {...this.props} key={this.props.task.id} />
        </div>

        <PlaceDescription place={this.props.task.place}
                          className="task-location-widget__place"/>

        <TaskLatLon task={this.props.task}
                    className="task-location-widget__lat-lon" />
      </QuickWidget>
    )
  }
}

registerWidgetType(TaskLocationWidget, descriptor)
