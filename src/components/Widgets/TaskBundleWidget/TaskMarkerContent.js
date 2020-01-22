import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _isFinite from 'lodash/isFinite'
import { messagesByStatus } from '../../../services/Task/TaskStatus/TaskStatus'
import { messagesByPriority } from '../../../services/Task/TaskPriority/TaskPriority'
import messages from './Messages'

/**
 * The content to show in the popup when a task marker is clicked.
 */
class TaskMarkerContent extends Component {
  toggleSelection = () => {
    this.props.toggleTaskSelectionById(this.props.marker.options.taskId)
  }

  render() {
    const selected = this.props.selectedTasks.has(this.props.marker.options.taskId)
    const statusMessage = messagesByStatus[
      _isFinite(this.props.marker.options.taskStatus) ?
      this.props.marker.options.taskStatus :
      this.props.marker.options.status
    ]
    const priorityMessage = messagesByPriority[
      _isFinite(this.props.marker.options.taskPriority) ?
      this.props.marker.options.taskPriority :
      this.props.marker.options.priority
    ]

    return (
      <div className="mr-flex mr-justify-center">
        <div className="mr-flex-col mr-w-full">
          <div className="mr-flex">
            <div className="mr-w-1/2 mr-mr-2 mr-text-right"><FormattedMessage {...messages.nameLabel} /></div>
            <div className="mr-w-1/2 mr-text-left">{this.props.marker.options.name}</div>
          </div>
          <div className="mr-flex">
            <div className="mr-w-1/2 mr-mr-2 mr-text-right"><FormattedMessage {...messages.taskIdLabel} /></div>
            <div className="mr-w-1/2 mr-text-left">{this.props.marker.options.taskId}</div>
          </div>
          <div className="mr-flex">
            <div className="mr-w-1/2 mr-mr-2 mr-text-right"><FormattedMessage {...messages.statusLabel} /></div>
            <div className="mr-w-1/2 mr-text-left">
              {statusMessage ? this.props.intl.formatMessage(statusMessage) : null}
            </div>
          </div>
          <div className="mr-flex">
            <div className="mr-w-1/2 mr-mr-2 mr-text-right"><FormattedMessage {...messages.priorityLabel} /></div>
            <div className="mr-w-1/2 mr-text-left">
              {priorityMessage ? this.props.intl.formatMessage(priorityMessage) : null}
            </div>
          </div>
          <div className="mr-flex mr-justify-center mr-mt-2">
            <span>
              <label>
                {this.props.marker.options.taskId !== this.props.task.id ?
                 <input
                   type="checkbox"
                   className="mr-mr-1"
                   checked={selected}
                   onChange={this.toggleSelection}
                 /> :
                 <span className="mr-mr-1">✓</span>
                }
                <FormattedMessage {...messages.selectedLabel} />
                {this.props.marker.options.taskId === this.props.task.id &&
                  <span className="mr-ml-1"><FormattedMessage {...messages.currentTask} /></span>
                }
              </label>
             </span>
          </div>
        </div>
      </div>
    )
  }
}

export default TaskMarkerContent
