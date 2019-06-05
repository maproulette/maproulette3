import React from 'react'
import _get from 'lodash/get'
import ProgressStatus from '../ProgressStatus/ProgressStatus'
import messages from './Messages'

/**
 * TaskDeletingProgress displays a full-page busy spinner and shows
 * the current task deletion progress (if provided)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default function(props) {
  return (
    <ProgressStatus
      progressItem={_get(props, 'progress.deletingTasks')}
      progressHeader={messages.deletingTasks}
      progressDescription={messages.tasksDeleted}
    />
  )
}
