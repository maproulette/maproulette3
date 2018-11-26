import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { messagesByStatus, TaskStatus }
       from '../../services/Task/TaskStatus/TaskStatus'
import messages from './Messages'
import './TaskStatusIndicator.scss'

/**
 * TaskStatusIndicator displays the current status of the given task.  By
 * default, the indicator only renders for statuses other than created. Set the
 * showAnyStatus prop to true to render regardless of status.
 *
 * If an OSM changeset is associated with the task, then a link to view the
 * changeset will also be displayed alongside the task status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskStatusIndicator extends Component {
  render() {
    if (!this.props.showAnyStatus &&
        this.props.task.status === TaskStatus.created) {
      return null
    }

    return (
      <div className="task-status">
        <div>
          <div className="task-status__label">
            <FormattedMessage {...messagesByStatus[this.props.task.status]} />

            {this.props.task.changesetId > 0 &&
             <a
               href={`https://www.openstreetmap.org/changeset/${this.props.task.changesetId}`}
               target="_blank"
               rel="noopener noreferrer"
               className="task-status__view-changeset-link"
             >
               <FormattedMessage {...messages.viewChangeset} />
             </a>
            }
          </div>
        </div>
      </div>
    )
  }
}

TaskStatusIndicator.propTypes = {
  /** The task for which status is to be displayed */
  task: PropTypes.object.isRequired,
  /** Set to true to render in minimized mode */
  isMinimized: PropTypes.bool,
  /** Set to true to render regardless of task status. */
  showAnyStatus: PropTypes.bool,
}
