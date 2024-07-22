import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import { messagesByStatus } from '../../../services/Task/TaskStatus/TaskStatus'
import { messagesByPriority } from '../../../services/Task/TaskPriority/TaskPriority'
import AsCooperativeWork from '../../../interactions/Task/AsCooperativeWork'
import messages from './Messages'

/**
 * The content to show in the popup when a task marker is clicked.
 */
class TaskMarkerContent extends Component {
  toggleSelection = () => {
    this.props.toggleTaskSelection(this.props.marker.options)
  }

  render() {
    const selected = this.props.isTaskSelected(this.props.marker.options.taskId);
    const taskId = this.props.marker.options.taskId ?? this.props.marker.options.id
    const bundle = (this.props.taskBundleData || []).map(bundleObject => bundleObject.id);
    const taskStatus = this.props.marker.options.status ?? this.props.marker.options.taskStatus
    const bundlePrimary = this.props.taskBundle?.tasks.find(task => task.isBundlePrimary === true)
    const statusMessage = messagesByStatus[this.props.marker.options.status ?? this.props.marker.options.taskStatus]
    const priorityMessage = messagesByPriority[this.props.marker.options.priority ?? this.props.marker.options.taskPriority ]
    const alreadyBundled = this.props.marker.options.bundleId && this.props.taskBundle?.bundleId !== this.props.marker.options.bundleId

    const checkBoxEnabled =
      !this.props.bundling &&
      !this.props.taskReadOnly &&
      [0, 3, 6].includes(taskStatus) &&
      this.props.workspace.name !== 'taskReview' &&
      !AsCooperativeWork(this.props.task).isTagType() &&
      this.props.marker.options.taskId !== this.props.task.id

    return (
      <div className="mr-flex mr-justify-center">
        <div className="mr-flex-col mr-w-full">
          <div className="mr-flex">
            <div className="mr-w-1/2 mr-mr-2 mr-text-right">
              <FormattedMessage {...messages.nameLabel} />
            </div>
            <div className="mr-w-1/2 mr-text-left">{this.props.marker.options.name || this.props.marker.options.geometries?.features[0]?.id}</div>
          </div>

          <div className="mr-flex">
            <div className="mr-w-1/2 mr-mr-2 mr-text-right">
              <FormattedMessage {...messages.taskIdLabel} />
            </div>
            <div className="mr-w-1/2 mr-text-left">
              <Link 
                to={`/challenge/${this.props.challengeId}/task/${this.props.marker.options.taskId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {this.props.marker.options.taskId}
              </Link>
            </div>
          </div>

          {statusMessage && (
            <div className="mr-flex">
              <div className="mr-w-1/2 mr-mr-2 mr-text-right">
                <FormattedMessage {...messages.statusLabel} />
              </div>
              <div className="mr-w-1/2 mr-text-left">
                {this.props.intl.formatMessage(statusMessage)}
              </div>
            </div>
          )}

          {priorityMessage && (
            <div className="mr-flex">
              <div className="mr-w-1/2 mr-mr-2 mr-text-right">
                <FormattedMessage {...messages.priorityLabel} />
              </div>
              <div className="mr-w-1/2 mr-text-left">
                {this.props.intl.formatMessage(priorityMessage)}
              </div>
            </div>
          )}

          <div className="mr-flex mr-justify-center mr-mt-2">
            <label>
              {alreadyBundled ? <FormattedMessage {...messages.alreadyBundledLabel} /> : checkBoxEnabled ? (
                <input
                  type="checkbox"
                  className="mr-mr-1"
                  checked={selected}
                  onChange={this.toggleSelection}
                />
              ) : !this.props.bundling && !this.props.marker.options.bundleId && this.props.marker.options.taskId === this.props.task.id ? (
                <span className="mr-mr-1">✓</span>
              ) : !this.props.bundling ? <span className="mr-mr-1"><FormattedMessage {...messages.unableToSelect} /></span> : null}

              {!this.props.bundling && !this.props.marker.options.bundleId && (checkBoxEnabled || this.props.marker.options.taskId === this.props.task.id) && (
                <span>
                  <FormattedMessage {...messages.selectedLabel} />
                  {this.props.marker.options.taskId === this.props.task.id && (
                    <span className="mr-ml-1">
                      <FormattedMessage {...messages.currentTask} />
                    </span>
                  )}
                </span>
              )}

              {this.props.bundling ? (
                <div>
                  {bundlePrimary?.id === taskId || (!bundlePrimary && taskId === this.props.task?.id) ? (
                    <FormattedMessage {...messages.cannotEditPrimaryTask} />
                  ) : this.props.bundling && bundle.includes(taskId) ? (
                    <button
                      disabled={this.props.bundleEditsDisabled}
                      onClick={() => this.props.unbundleTask(this.props.marker.options)}
                      className="mr-text-red mr-border-solid mr-border mr-border-red mr-px-2 mr-mb-1"
                      style={{
                        cursor: this.props.bundleEditsDisabled ? 'default' : 'pointer',
                        opacity: this.props.bundleEditsDisabled ? 0.3 : 1,
                      }}
                    >
                      <FormattedMessage {...messages.removeFromBundle} />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </label>
          </div>
        </div>
      </div>
    )
  }
}

export default TaskMarkerContent
