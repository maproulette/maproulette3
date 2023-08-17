import React, { Component } from 'react'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import TaskMap from '../../TaskPane/TaskMap/TaskMap'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'
import { FormattedMessage } from 'react-intl'
import EditSwitch from './RapidEditor/EditSwitch'
import RapidEditor from './RapidEditor/RapidEditor';
import WithKeyboardShortcuts from '../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'

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
  state = {
    counter: 0
  }

  componentWillUnmount = () => {
    this.props.resumeKeyboardShortcuts()
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.task.id !== this.props.task.id) {
      this.setState({ counter: this.state.counter + 1 })
    }

    if (this.state.counter % 2) {
      this.setState({ counter: this.state.counter + 1 })
    }

    this.handlePauseShortcuts()
  }

  handlePauseShortcuts = () => {
    const editMode = this.props.getUserAppSetting ? this.props.getUserAppSetting(this.props.user, 'isEditMode') : false;

    if (editMode) {
      this.props.pauseKeyboardShortcuts()
    } else {
      this.props.resumeKeyboardShortcuts()
    }
  }

  handleRenderRapid = () => {
    if (this.state.counter % 2) {
      return null
    } else {
      return (
        <RapidEditor
          setDisable={() => null}
          comment={this.props.task.parent.checkinComment}
          presets={[]}
          imagery={undefined}
          powerUser={null}
          locale={this.props.user.settings.locale}
          token={this.props.user.osmProfile.requestToken}
          task={this.props.task}
        />
      )
    }
  }

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
                </>
              : null
          }
          {
            editMode
              ? this.handleRenderRapid()
              : <MapPane {...this.props}>
                  <TaskMap {...this.props} challenge={this.props.task.parent} />
                </MapPane>
          }
        </div>
      </QuickWidget>
    )
  }
}

registerWidgetType(WithKeyboardShortcuts(TaskMapWidget), descriptor)
