import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import messages from './Messages'

/**
 * TaskUploadingProgress displays a full-page busy spinner and shows
 * the current upload progress (if provided)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskUploadingProgress extends Component {
  render() {
    // If task uploading not in progress, nothing to do
    if (!_get(this.props, 'progress.creatingTasks.inProgress', false)) {
      return null
    }

    // Show a message and busy spinner. If we also have completion/progress
    // data, then show that too.
    return (
      <div className="pane-loading full-screen-height">
        <div className="progress-status">
          <h1 className="progress-status__title">
            <FormattedMessage {...messages.creatingTasks} />
          </h1>

          <div className="progress-status__description">
            {_isFinite(this.props.progress.creatingTasks.stepsCompleted) &&
              <React.Fragment>
                {
                  this.props.progress.creatingTasks.stepsCompleted
                } <FormattedMessage {...messages.tasksCreated} />
              </React.Fragment>
            }
            <BusySpinner />
          </div>
        </div>
      </div>
    )
  }
}

TaskUploadingProgress.propTypes = {
  progress: PropTypes.object,
}
