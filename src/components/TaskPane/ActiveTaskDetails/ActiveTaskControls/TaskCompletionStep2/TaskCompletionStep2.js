import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _pick from 'lodash/pick'
import _isEmpty from 'lodash/isEmpty'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus } from '../../../../../services/Task/TaskReview/TaskReviewStatus'
import TaskFixedControl from '../TaskFixedControl/TaskFixedControl'
import TaskTooHardControl from '../TaskTooHardControl/TaskTooHardControl'
import TaskAlreadyFixedControl from '../TaskAlreadyFixedControl/TaskAlreadyFixedControl'
import TaskSkipControl from '../TaskSkipControl/TaskSkipControl'
import TaskFalsePositiveControl from '../TaskFalsePositiveControl/TaskFalsePositiveControl'
import TaskRevisedControl from '../TaskRevisedControl/TaskRevisedControl'
import TaskCancelEditingControl from '../TaskCancelEditingControl/TaskCancelEditingControl'
import Dropdown from '../../../../Dropdown/Dropdown'
import './TaskCompletionStep2.scss'

const hiddenShortcutGroup = 'taskCompletion'
const hiddenShortcuts = ['skip', 'falsePositive', 'fixed', 'tooHard', 'alreadyFixed']

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

  completeTask = (key) => {
    // Ignore if the shortcut group is not active
    if (_isEmpty(this.props.activeKeyboardShortcuts?.[hiddenShortcutGroup])) {
      return;
    }

    // Handle different keyboard shortcuts
    switch (key) {
      case 'f':
        this.props.complete(TaskStatus.fixed)
        break
      case 'd':
        this.props.complete(TaskStatus.tooHard)
        break
      case 'x':
        this.props.complete(TaskStatus.alreadyFixed)
        break
      case 'w':
        this.props.complete(TaskStatus.skipped)
        break
      case 'q':
        this.props.complete(TaskStatus.falsePositive)
        break
      default:
        break // Handle other keys or do nothing
    }
  }

  handleKeyboardShortcuts = (event) => {
    if (_isEmpty(this.props.activeKeyboardShortcuts[hiddenShortcutGroup])) {
      return
    }

    if (this.props.textInputActive(event)) {
      return // Ignore typing in inputs
    }

    if (event.metaKey || event.altKey || event.ctrlKey) {
      return
    }

    this.completeTask(event.key)
  }

  componentDidUpdate() {
    if (
      !_isEmpty(this.props.activeKeyboardShortcuts?.[hiddenShortcutGroup]) &&
      this.props.editMode
    ) {
      hiddenShortcuts.forEach((shortcut) => {
        this.props.deactivateKeyboardShortcut(
          hiddenShortcutGroup,
          shortcut,
          this.handleKeyboardShortcuts(shortcut)
        );
      });
    } else if (
      _isEmpty(this.props.activeKeyboardShortcuts?.[hiddenShortcutGroup]) &&
      this.props.keyboardShortcutGroups &&
      this.props.activateKeyboardShortcut &&
      !this.props.editMode
    ) {
      hiddenShortcuts.forEach((shortcut) => {
        this.props.activateKeyboardShortcut(
          hiddenShortcutGroup,
          _pick(this.props.keyboardShortcutGroups.taskCompletion, shortcut),
          this.handleKeyboardShortcuts
        )
      })
    }
  }
  
  componentWillUnmount() {
    if (!_isEmpty(this.props.activeKeyboardShortcuts?.[hiddenShortcutGroup])) {
      hiddenShortcuts.forEach((shortcut) => {
        this.props.deactivateKeyboardShortcut(
          hiddenShortcutGroup,
          shortcut,
          this.handleKeyboardShortcuts
        )
      })
    }
  }

  render() {
    let complete = this.props.complete
    if (this.props.needsRevised) {
      complete = (status) => this.props.complete(status, TaskReviewStatus.needed)
    }
    
    return (
      <div>
        <div className="mr-my-4 mr-grid mr-grid-columns-2 mr-grid-gap-4">
          {this.props.allowedProgressions.has(TaskStatus.fixed) &&
            <TaskFixedControl {...this.props} complete={complete} />
          }

          {this.props.allowedProgressions.has(TaskStatus.tooHard) &&
            <TaskTooHardControl {...this.props} complete={complete} />
          }

          {this.props.allowedProgressions.has(TaskStatus.alreadyFixed) &&
            <TaskAlreadyFixedControl {...this.props} complete={complete} />
          }

          {this.props.allowedProgressions.has(TaskStatus.falsePositive) &&
            <TaskFalsePositiveControl {...this.props} complete={complete} />
          }

          {(this.props.allowedProgressions.has(TaskStatus.skipped) ||
            this.props.allowedProgressions.has(TaskStatus.falsePositive)) &&
            !this.props.needsRevised &&
           <Dropdown
             className="mr-dropdown--fixed mr-w-full"
             dropdownButton={dropdown =>
               <MoreOptionsButton toggleDropdownVisible={dropdown.toggleDropdownVisible} />
             }
             dropdownContent={dropdown =>
               <ListMoreOptionsItems {...this.props} toggleDropdownVisible={dropdown.toggleDropdownVisible}/>
             }
           />
          }
        </div>

        {this.props.needsRevised &&
          <TaskRevisedControl {...this.props} className="mr-mb-4" />
        }
        
        {!this.props.editMode ? <TaskCancelEditingControl {...this.props} className="" /> : null}
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
       <li onClick={props.toggleDropdownVisible}>
         <TaskSkipControl {...props} asLink />
       </li>
      }
      {props.allowedProgressions.has(TaskStatus.falsePositive) &&
       <li onClick={props.toggleDropdownVisible}>
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
