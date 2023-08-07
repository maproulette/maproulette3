import React, { Component } from 'react'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import TaskMap from '../../TaskPane/TaskMap/TaskMap'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'
import { FormattedMessage } from 'react-intl'
import EditSwitch from './RapidEditor/EditSwitch'
import NotificationCard from './RapidEditor/NotificaitonCard'
import RapidEditor from './RapidEditor/RapidEditor';
import { createBoundsXml } from './RapidEditor/createBoundsXml'

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
        <div
          className="mr-mt-2"
          style={{height: "calc(100% - 3rem)"}}
        >
          {
            this.props.getUserAppSetting 
              ? <>
                  <div className="mr-flex mr-items-center ">
                    <div className="mr-text-yellow mr-mr-3">
                      <FormattedMessage {...messages.editMode}/>
                    </div>
                      <div className="mr-mt-1 mr-mb-2">
                        <EditSwitch {...this.props}/>
                      </div>
                    </div>
                  <div> 
                    <NotificationCard {...this.props}/>
                  </div>
                </>
              : null
          }
          {
            editMode
              ? <RapidEditor
                  setDisable={() => null}
                  comment={this.props.task.parent.checkinComment}
                  presets={[]}
                  imagery={undefined}
                  //gpxUrl={'https://tasking-manager-staging-api.hotosm.org/api/v2/projects/8512/tasks/queries/gpx/?tasks=440'}
                  gpxUrl={createBoundsXml(this.props.task.location.coordinates)}
                  powerUser={null}
                  locale={this.props.user.settings.locale}
                  token={this.props.user.osmProfile.requestToken}
                />
              : <MapPane {...this.props}>
                  <TaskMap {...this.props} challenge={this.props.task.parent} />
                </MapPane>
          }
        </div>
      </QuickWidget>
    )
  }
}

registerWidgetType(TaskMapWidget, descriptor)
