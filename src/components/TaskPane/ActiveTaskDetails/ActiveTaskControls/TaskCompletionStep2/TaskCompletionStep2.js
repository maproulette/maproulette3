import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
import TaskFixedControl from '../TaskFixedControl/TaskFixedControl'
import TaskTooHardControl from '../TaskTooHardControl/TaskTooHardControl'
import TaskAlreadyFixedControl from '../TaskAlreadyFixedControl/TaskAlreadyFixedControl'
import TaskSkipControl from '../TaskSkipControl/TaskSkipControl'
import TaskFalsePositiveControl from '../TaskFalsePositiveControl/TaskFalsePositiveControl'
import TaskRevisedControl from '../TaskRevisedControl/TaskRevisedControl'
import TaskCancelEditingControl from '../TaskCancelEditingControl/TaskCancelEditingControl'
import Dropdown from '../../../../Dropdown/Dropdown'
import './TaskCompletionStep2.scss'

/**
 * TaskCompletionStep2 presents controls for finishing up completion of a
 * task after an editor has been opened. It allows the user to mark that they
 * fixed the task, the task was too hard, it was already fixed by someone else,
 * etc. The user can also cancel and abort completion of the task.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskCompletionStep2 extends Component {
  state = {
    moreOptionsOpen: false,
  }

  render() {
    return (
      <div>
        <div className="mr-my-4 mr-grid mr-grid-columns-2 mr-grid-gap-4">
          {this.props.allowedProgressions.has(TaskStatus.fixed) &&
            <TaskFixedControl {...this.props} />
          }

          {this.props.allowedProgressions.has(TaskStatus.tooHard) &&
            <TaskTooHardControl {...this.props} />
          }

          {this.props.allowedProgressions.has(TaskStatus.alreadyFixed) &&
            <TaskAlreadyFixedControl {...this.props} />
          }

          {(this.props.allowedProgressions.has(TaskStatus.skipped) ||
            this.props.allowedProgressions.has(TaskStatus.falsePositive)) &&
           <Dropdown
             className="mr-dropdown--fixed mr-w-full"
             dropdownButton={dropdown =>
               <MoreOptionsButton toggleDropdownVisible={dropdown.toggleDropdownVisible} />
             }
             dropdownContent={dropdown =>
               <ListMoreOptionsItems {...this.props} />
             }
           />
          }
        </div>

        {this.props.needsRevised &&
          <TaskRevisedControl {...this.props} className="mr-mb-4" />
        }

        <TaskCancelEditingControl {...this.props} className="" />
      </div>
    )
  }
}

const MoreOptionsButton = function(props) {
  return (
    <button
      className="mr-dropdown__button mr-button mr-text-green-lighter mr-w-full"
      onClick={props.toggleDropdownVisible}
    >
      Other&hellip;
    </button>
  )
}

const ListMoreOptionsItems = function(props) {
  return (
    <ol className="mr-list-dropdown">
      {props.allowedProgressions.has(TaskStatus.skipped) &&
       <li>
         <TaskSkipControl {...props} asLink />
       </li>
      }
      {props.allowedProgressions.has(TaskStatus.falsePositive) &&
       <li>
         <TaskFalsePositiveControl {...props} asLink />
       </li>
      }
    </ol>
  )
}

TaskCompletionStep2.propTypes = {
  /** The task being completed */
  task: PropTypes.object.isRequired,
  /** Invoked if the user cancels and the editor is to be closed */
  cancelEditing: PropTypes.func.isRequired,
  /** The keyboard shortcuts to be offered on this step */
  keyboardShortcutGroups: PropTypes.object.isRequired,
}
