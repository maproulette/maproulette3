import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _omit from 'lodash/omit'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
import TaskEditControl from '../TaskEditControl/TaskEditControl'
import TaskFalsePositiveControl from '../TaskFalsePositiveControl/TaskFalsePositiveControl'
import TaskSkipControl from '../TaskSkipControl/TaskSkipControl'
import TaskSaveControls from '../TaskSaveControls/TaskSaveControls'
import './TaskCompletionStep1.css'


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
      <div className="active-task-controls__step1 active-task-controls__control-block">
        {this.props.allowedProgressions.has(TaskStatus.fixed) &&
          <TaskEditControl pickEditor={this.props.pickEditor}
                           className="active-task-controls__edit-control"
                           {..._omit(this.props, 'className')} />
        }

        {this.props.allowedProgressions.has(TaskStatus.falsePositive) &&
          <TaskFalsePositiveControl complete={this.props.complete}
                                    className="active-task-controls__false-positive-control"
                                    {..._omit(this.props, 'className')} />
        }

        {this.props.allowedProgressions.has(TaskStatus.skipped) &&
          <TaskSkipControl complete={this.props.complete}
                          className="active-task-controls__skip-control"
                          {..._omit(this.props, 'className')} />
        }

        <TaskSaveControls {..._omit(this.props, 'className')} />
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
