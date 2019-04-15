import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import TaskHistoryList from '../../TaskHistoryList/TaskHistoryList'
import TaskCommentInput from '../../TaskCommentInput/TaskCommentInput'
import WithTaskHistory from '../../HOCs/WithTaskHistory/WithTaskHistory'
import WithSearch from '../../HOCs/WithSearch/WithSearch'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import QuickWidget from '../../QuickWidget/QuickWidget'
import { viewDiffOverpass, viewOSMCha } from '../../../services/Overpass/Overpass'
import messages from './Messages'
import _get from 'lodash/get'
import _remove from 'lodash/remove'
import _indexOf from 'lodash/indexOf'
import _each from 'lodash/each'

const descriptor = {
  widgetKey: 'TaskHistoryWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 4,
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
      this.setState({selectedTimestamps: [], diffSelectionActive: false})
    }
    else {
      this.setState({selectedTimestamps: diffTimestamps})
    }
  }

  viewDiff = () => {
    viewDiffOverpass(AsMappableTask(this.props.task).calculateBBox(),
                     ...this.state.selectedTimestamps)
  }

  viewOSMCha = () => {
    let earliestDate = null
    const usernames = []

    _each(this.props.task.history, (log) => {
      if (!earliestDate || log.timestamp < earliestDate) {
        earliestDate = log.timestamp
      }

      const username = _get(log, 'user.username')
      if (username && usernames.indexOf(username) === -1) {
        usernames.push(username)
      }
    })

    viewOSMCha(AsMappableTask(this.props.task).calculateBBox(),
               earliestDate, usernames)
  }

  getEditor = () => {
    return _get(this.props, 'user.settings.defaultEditor')
  }

  setComment = comment => this.setState({comment})

  postComment = () => {
    this.props.postTaskComment(this.props.task, this.state.comment).then(() => {
        this.props.reloadHistory()
    })
    this.setComment("")
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
            <button className="mr-button mr-button--small mr-mr-2"
                    onClick={this.viewOSMCha}>
              <FormattedMessage {...messages.viewOSMCha} />
            </button>
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
        <div className="mr-my-8 mr-mr-4">
          <TaskCommentInput
            value={this.state.comment}
            commentChanged={this.setComment}
            submitComment={this.postComment}
          />
        </div>

        <TaskHistoryList
          className="mr-px-4"
          taskHistory={this.props.task.history}
          task={AsMappableTask(this.props.task)}
          editor={this.getEditor()}
          mapBounds={this.props.mapBounds}
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

registerWidgetType(
  WithSearch(WithTaskHistory(TaskHistoryWidget), 'task'),
  descriptor
)
