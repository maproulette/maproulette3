import React, { Component } from 'react'
import _get from 'lodash/get'
import WithLoadedTask from '../HOCs/WithLoadedTask/WithLoadedTask'
import messages from './Messages'

/**
 * The content to show in the popup when a task marker is clicked.
 */
class TaskChallengeMarkerContent extends Component {
  render() {
    const markerData = this.props.marker
    return (
      <div className="marker-popup-content">
        <h3>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a onClick={() => this.props.history.push(
            `/browse/challenges/${markerData.options.parentId}`
          )}>
            {markerData.options.parentName || _get(this.props.task, 'parent.name')}
          </a>
        </h3>

        <div className="marker-popup-content__links">
          <div>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={() => {
              this.props.startChallengeWithTask(
                markerData.options.parentId,
                false,
                markerData.options.taskId)
            }}>
              {this.props.intl.formatMessage(messages.startChallengeLabel)}
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default WithLoadedTask(TaskChallengeMarkerContent)
