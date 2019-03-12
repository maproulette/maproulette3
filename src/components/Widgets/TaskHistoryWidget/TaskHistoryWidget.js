import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import TaskHistoryList from '../../TaskHistoryList/TaskHistoryList'
import WithTaskHistory from '../../HOCs/WithTaskHistory/WithTaskHistory'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import QuickWidget from '../../QuickWidget/QuickWidget'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import { viewDiffOverpass } from '../../../services/Overpass/Overpass'
import messages from './Messages'
import _get from 'lodash/get'
import _remove from 'lodash/remove'
import _indexOf from 'lodash/indexOf'

const descriptor = {
  widgetKey: 'TaskHistoryWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 3,
  defaultHeight: 6,
}

export default class TaskHistoryWidget extends Component {
  state = {
    diffSelectionActive: false,
    selectedTimestamps: [],
  }

  toggleSelection = (timestamp) => {
    const diffTimestamps = this.state.selectedTimestamps
    if (_indexOf(diffTimestamps, timestamp.toString()) !== -1) {
      _remove(diffTimestamps, timestamp)
    }
    else {
      diffTimestamps.push(timestamp.toString())
    }

    if (diffTimestamps.length >= 2 ) {
      viewDiffOverpass(AsMappableTask(this.props.task).calculateBBox(),
                       ...diffTimestamps.slice(-2))
      this.setState({selectedTimestamps: []})
    }
    else {
      this.setState({selectedTimestamps: diffTimestamps})
    }
  }

  viewDiff = () => {
    viewDiffOverpass(AsMappableTask(this.props.task).calculateBBox(),
                     ...this.state.selectedTimestamps)
  }

  getEditor = () => {
    return _get(this.props, 'user.settings.defaultEditor')
  }

  render() {
    return (
      <QuickWidget
        {...this.props}
        className="task-history-widget"
        widgetTitle={
          <FormattedMessage {...messages.title} />
        }
        rightHeaderControls={
          <div className="mr-flex mr-justify-between">
            {this.state.diffSelectionActive ?
              <button className="mr-button mr-button--small"
                      onClick={() => {
                        this.setState({diffSelectionActive: !this.state.diffSelectionActive,
                                       selectedTimestamps: []})}
                      }>
                <FormattedMessage {...messages.cancelDiff} />
              </button> :
              <button className="mr-button mr-button--small"
                      onClick={() => {
                        this.setState({diffSelectionActive: !this.state.diffSelectionActive,
                                       selectedTimestamps: []})}
                      }>
                <FormattedMessage {...messages.startDiff} />
              </button>
            }
          </div>
        }
       >

        <TaskHistoryList
          className="mr-px-4"
          taskHistory={this.props.task.history}
          task={AsMappableTask(this.props.task)}
          editor={this.getEditor()}
          selectDiffs={this.state.diffSelectionActive}
          toggleSelection={this.toggleSelection}
          selectedTimestamps={this.state.selectedTimestamps}
        />
      </QuickWidget>
    )
  }
}

TaskHistoryWidget.propTypes = {
}

registerWidgetType(WithTaskHistory(TaskHistoryWidget), descriptor)
