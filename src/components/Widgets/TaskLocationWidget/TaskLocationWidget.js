import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import TaskLocationMap from '../../TaskPane/TaskLocationMap/TaskLocationMap'
import PlaceDescription from '../../TaskPane/PlaceDescription/PlaceDescription'
import TaskLatLon from '../../TaskPane/TaskLatLon/TaskLatLon'
import QuickWidget from '../../QuickWidget/QuickWidget'
import Dropdown from '../../Dropdown/Dropdown'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskLocationWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 6,
  defaultHeight: 8,
  defaultConfiguration: {
    reverseLonLat: false,
  }
}

export default class TaskLocationWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="task-location-widget"
        widgetTitle={<FormattedMessage {...messages.title} />}
        noMain
        rightHeaderControls = {
          <Dropdown
            className="mr-dropdown--right"
            dropdownButton={dropdown => (
              <button
                onClick={dropdown.toggleDropdownVisible}
                className="mr-flex mr-items-center mr-text-green-lighter"
              >
                <SvgSymbol
                  sym="cog-icon"
                  viewBox="0 0 20 20"
                  className="mr-fill-green-lighter mr-w-4 mr-h-4"
                />
              </button>
            )}
            dropdownContent={dropdown => (
              <React.Fragment>
                <span className="mr-mr-2">
                  <FormattedMessage {...messages.showPrompt} />
                </span>

                <select
                  value={this.props.widgetConfiguration.reverseLonLat ? "latlon" : "lonlat"}
                  onChange={e => {
                    this.props.updateWidgetConfiguration({reverseLonLat: e.target.value === "latlon"})
                    dropdown.closeDropdown()
                  }}
                  className="mr-select mr-p-1 mr-pr-4"
                >
                  <option key="lonlat" value="lonlat">
                    {this.props.intl.formatMessage(messages.lonLatLabel)}
                  </option>
                  <option key="latlon" value="latlon">
                    {this.props.intl.formatMessage(messages.latLonLabel)}
                  </option>
                </select>
              </React.Fragment>
            )}
          />
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
          place={this.props.task.place}
          className="mr-text-xs mr-mt-4"
        />

        <TaskLatLon
          task={this.props.task}
          reverse={this.props.widgetConfiguration.reverseLonLat}
          className="mr-text-xs mr-mt-3"
        />
      </QuickWidget>
    )
  }
}

registerWidgetType(TaskLocationWidget, descriptor)
