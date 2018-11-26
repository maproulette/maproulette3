import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
import UserEditorSelector
       from '../../../../UserEditorSelector/UserEditorSelector'
import TaskEditControl from '../TaskEditControl/TaskEditControl'
import TaskFalsePositiveControl from '../TaskFalsePositiveControl/TaskFalsePositiveControl'
import TaskSkipControl from '../TaskSkipControl/TaskSkipControl'
import './TaskCompletionStep1.scss'


/**
 * TaskCompletionStep1 renders and manages controls and keyboard shortcuts for
 * initiating editing a task (fix, skip, false positive).
 *
 * @see See ActiveTaskControls
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskCompletionStep1 extends Component {
  render() {
    return (
      <div>
        <UserEditorSelector {...this.props} className="mr-mb-4" />
        <div className="mr-my-4 mr-grid mr-grid-columns-2 mr-grid-gap-4">
          {this.props.allowedProgressions.has(TaskStatus.fixed) &&
          <TaskEditControl {...this.props} />
          }

          {this.props.allowedProgressions.has(TaskStatus.falsePositive) &&
          <TaskFalsePositiveControl {...this.props} />
          }

          {this.props.allowedProgressions.has(TaskStatus.skipped) &&
          <TaskSkipControl {...this.props} />
          }
        </div>
      </div>
    )
  }
}

TaskCompletionStep1.propTypes = {
  /** The current active task */
  task: PropTypes.object.isRequired,
  /** The current map bounds (for editing) */
  mapBounds: PropTypes.object,
  /** Invoked if the user wishes to edit the task */
  pickEditor: PropTypes.func.isRequired,
  /** Invoked if the user immediately completes the task (false positive) */
  complete: PropTypes.func.isRequired,
}
