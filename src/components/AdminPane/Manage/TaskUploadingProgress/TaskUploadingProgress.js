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
      <div className="mr-flex mr-justify-center mr-min-h-screen-50 mr-m-12">
        <div className="mr-bg-blue-dark-75 mr-w-3/4 mr-p-4 mr-flex mr-items-center mr-justify-center mr-text-center">
          <div className="mr-flex-col mr-items-center mr-text-center">
            <div className="mr-text-yellow mr-text-4xl mr-mb-4">
              <FormattedMessage {...messages.creatingTasks} />
            </div>

            <div className="mr-white mr-text-lg">
              {_isFinite(this.props.progress.creatingTasks.stepsCompleted) &&
                <React.Fragment>
                  {
                    this.props.progress.creatingTasks.stepsCompleted
                  } <FormattedMessage {...messages.tasksCreated} />
                </React.Fragment>
              }
              <BusySpinner className="mr-mt-4" />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

TaskUploadingProgress.propTypes = {
  progress: PropTypes.object,
}
