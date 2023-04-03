import React, { Component } from 'react'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import TaskMap from '../../TaskPane/TaskMap/TaskMap'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'
import { FormattedMessage} from 'react-intl'
import EditSwitch from '../../AdminPane/Manage/EditSwitch/EditSwitch'
import NotificationCard from '../../AdminPane/Manage/NotificationCard/NotificationCard'

const descriptor = {
  widgetKey: 'TaskMapWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 9,
  minHeight: 5,
  defaultHeight: 19,
}

export default class TaskMapWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="task-map-widget"
        noMain
        permanent
      >
        <div className="mr-flex mr-items-center ">
          <div className="mr-text-yellow mr-mr-3">
            <FormattedMessage {...messages.editMode}/>
          </div>

          <div>
            <div className="mr-mt-1">
              <EditSwitch {...this.props}/>
              </div>
          </div>
         </div>

         <div> 
            <NotificationCard {...this.props}/>
        </div>

        <MapPane {...this.props}>
          <TaskMap {...this.props} challenge={this.props.task.parent} />
        </MapPane>
      </QuickWidget>
    )
  }
}

registerWidgetType(TaskMapWidget, descriptor)
