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

import RapidEditor from './RapidEditor';
// const RapidEditor = React.lazy(() => import('./RapidEditor'))

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
    const editMode = this.props.getUserAppSetting ? this.props.getUserAppSetting(this.props.user, 'isEditMode') : false;

    return (
      <QuickWidget
        {...this.props}
        className="task-map-widget"
        noMain
        permanent
      >
        {
          this.props.getUserAppSetting 
            ? <>
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
              </>
            : null
        }
        <MapPane {...this.props}>
          {
            editMode
              ? <RapidEditor
                  setDisable={() => null}
                  comment={"#maproulette"}
                  presets={['building']}
                  imagery={undefined}
                  gpxUrl={undefined}
                  powerUser={null}
                />
              : <TaskMap {...this.props} challenge={this.props.task.parent} />
          }
        </MapPane>
      </QuickWidget>
    )
  }
}

registerWidgetType(TaskMapWidget, descriptor)
