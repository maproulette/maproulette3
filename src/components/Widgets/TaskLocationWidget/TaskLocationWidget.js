import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType } 
from '../../../services/Widget/Widget'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import TaskLocationMap from '../../TaskPane/TaskLocationMap/TaskLocationMap'
import PlaceDescription from '../../TaskPane/PlaceDescription/PlaceDescription'
import TaskLatLon from '../../TaskPane/TaskLatLon/TaskLatLon'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

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
  toggleReverseLonLat = (reverseLonLat) => {
    this.props.updateUserAppSetting(this.props.user.id, {
      'reverseLonLat': !reverseLonLat,
    })
  }

  render() {
    const reverseLonLat = this.props.user?.properties?.mr3Frontend?.settings?.reverseLonLat || false

    return (
      <QuickWidget
        {...this.props}
        className="task-location-widget"
        widgetTitle={<FormattedMessage {...messages.title} />}
        noMain
        rightHeaderControls={
          <>
            <span className="mr-mr-2">
              <FormattedMessage {...messages.switchPrompt} />
            </span>
            {reverseLonLat ? (
              <button className="mr-button mr-button--xsmall" onClick={() => this.toggleReverseLonLat(reverseLonLat)}>
                {this.props.intl.formatMessage(messages.lonLatLabel)}
              </button>
            ) : (
              <button className="mr-button mr-button--xsmall" onClick={() => this.toggleReverseLonLat(reverseLonLat)}>
                {this.props.intl.formatMessage(messages.latLonLabel)}
              </button>
            )}
          </>
        }
      >
        <div
          className="mr-mt-5"
          style={{height: "calc(100% - 6rem)"}}
        >
          <MapPane {...this.props}>
            <TaskLocationMap
              key={this.props.task.id}
              {...this.props}
              h={this.props.widgetLayout.h}
              w={this.props.widgetLayout.w}
            />
          </MapPane>
        </div>

        <PlaceDescription
          address={this.props.task.place?.address}
          className="mr-text-xs mr-mt-4"
        />

        <TaskLatLon
          task={this.props.task}
          reverse={reverseLonLat}
          className="mr-text-xs mr-mt-3"
        />
      </QuickWidget>
    )
  }
}

registerWidgetType(TaskLocationWidget, descriptor)
