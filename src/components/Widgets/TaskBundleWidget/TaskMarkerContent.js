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
    this.props.toggleTaskSelection(this.props.marker.options)
  }

  render() {
    const bundle = this.props.taskBundleData?.map((bundleObject) => bundleObject.id) || []
    const selected = this.props.isTaskSelected(this.props.marker.options.taskId)
    const isChecked = (
      !this.props.bundling && 
      this.props.marker.options.taskId !== this.props.task.id && 
      !this.props.marker.options.bundleId
    )
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
          {[
            ['nameLabel', this.props.marker.options.name],
            ['taskIdLabel', this.props.marker.options.taskId],
            ['statusLabel', statusMessage && this.props.intl.formatMessage(statusMessage)],
            ['priorityLabel', priorityMessage && this.props.intl.formatMessage(priorityMessage)],
          ].map(([labelMessageId, content]) => (
            <div key={labelMessageId} className="mr-flex">
              <div className="mr-w-1/2 mr-mr-2 mr-text-right">
                <FormattedMessage {...messages[labelMessageId]} />
              </div>
              <div className="mr-w-1/2 mr-text-left">{content}</div>
            </div>
          ))}

          <div className="mr-flex mr-justify-center mr-mt-2">
            <label>
              {isChecked ? (
                <input
                  type="checkbox"
                  className="mr-mr-1"
                  checked={selected}
                  onChange={this.toggleSelection}
                />
              ) : (
                !this.props.bundling && !this.props.marker.options.bundleId && (
                  <span className="mr-mr-1">✓</span>
                )
              )}

              {!this.props.bundling && !this.props.marker.options.bundleId && (
                <span>
                  <FormattedMessage {...messages.selectedLabel} />
                  {this.props.marker.options.taskId === this.props.task.id && (
                    <span className="mr-ml-1">
                      <FormattedMessage {...messages.currentTask} />
                    </span>
                  )}
                </span>
              )}

                <div>
                  {this.props.task.id === this.props.marker.options.id ? 
                    <div>Cannot edit primary task</div> : 
                    this.props.bundling && bundle.includes(this.props.marker.options.taskId) ? 
                  (
                    <button
                      onClick={() => this.props.unbundleTask(this.props.marker.options)}
                      className="mr-text-red mr-border-solid mr-border mr-border-red mr-px-2 mr-mb-1"
                    >
                      Remove from Bundle
                    </button>
                  ) : this.props.bundling && !this.props.marker.options.bundleId ? (
                    <button
                      onClick={() => this.props.bundleTask(this.props.marker.options)}
                      className="mr-text-green mr-border-solid mr-border mr-border-green mr-px-2 mr-mb-1"
                    >
                      Add to Bundle
                    </button>
                  ) : this.props.bundling ? <div>This task is currently bundled by someone else</div> : null}
                </div>
            </label>
          </div>
        </div>
      </div>
    )
  }
}

export default TaskMarkerContent
