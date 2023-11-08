import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _pick from 'lodash/pick'
import _isEmpty from 'lodash/isEmpty'
import { FormattedMessage } from 'react-intl'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus } from '../../../../../services/Task/TaskReview/TaskReviewStatus'
import UserEditorSelector
       from '../../../../UserEditorSelector/UserEditorSelector'
import Dropdown from '../../../../Dropdown/Dropdown'
import TaskEditControl from '../TaskEditControl/TaskEditControl'
import TaskFalsePositiveControl from '../TaskFalsePositiveControl/TaskFalsePositiveControl'
import TaskFixedControl from '../TaskFixedControl/TaskFixedControl'
import TaskTooHardControl from '../TaskTooHardControl/TaskTooHardControl'
import TaskAlreadyFixedControl from '../TaskAlreadyFixedControl/TaskAlreadyFixedControl'
import TaskSkipControl from '../TaskSkipControl/TaskSkipControl'
import TaskRevisedControl from '../TaskRevisedControl/TaskRevisedControl'
import './TaskCompletionStep1.scss'
import messages from './Messages'
import ErrorTagComment from '../../../../ErrorTagComment/ErrorTagComment'

const hiddenShortcutGroup = 'taskCompletion'
const hiddenShortcuts = ['skip', 'falsePositive', 'fixed', 'tooHard', 'alreadyFixed']

/**
 * TaskCompletionStep1 renders and manages controls and keyboard shortcuts for
 * initiating editing a task (fix, skip, false positive).
 *
 * @see See ActiveTaskControls
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskCompletionStep1 extends Component {
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
    event.preventDefault()
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
    return (
      <div>
        {this.props.needsRevised &&
          <div className={`${ this.props.task?.errorTags ? "mr-text-red" : "mr-text-white" } mr-text-md mr-mt-4`}>
            <div>
              <FormattedMessage {...messages.revisionNeeded} />{" "}
              {
                this.props.task?.errorTags
                  ? <>
                      <FormattedMessage {...messages.errorTagsApplied} />:{" "}
                      <ErrorTagComment errorTags={this.props.task.errorTags} />{" "}
                    </>
                  : ""
              }
              <FormattedMessage {...messages.checkComments} />
            </div>
          </div>
        }

        <UserEditorSelector
          {...this.props}
          className="mr-mb-4"
        />
        <div className="mr-my-4 mr-grid mr-grid-columns-2 mr-grid-gap-4">
          {(this.props.allowedProgressions.has(TaskStatus.fixed) || this.props.needsRevised) &&
           <TaskEditControl {...this.props} />
          }

          {this.props.allowedProgressions.has(TaskStatus.falsePositive) &&
            !this.props.needsRevised &&
           <TaskFalsePositiveControl {...this.props} />
          }

          {this.props.allowedProgressions.has(TaskStatus.skipped) &&
            !this.props.needsRevised &&
           <TaskSkipControl {...this.props} />
          }

          {this.props.needsRevised &&
            <TaskRevisedControl {...this.props} className="" />
          }

          {(this.props.allowedProgressions.has(TaskStatus.fixed) ||
            this.props.allowedProgressions.has(TaskStatus.tooHard) ||
            this.props.allowedProgressions.has(TaskStatus.alreadyFixed)) &&
           <Dropdown
             className="mr-dropdown--fixed mr-w-full"
             dropdownButton={dropdown =>
               <MoreOptionsButton
                  toggleDropdownVisible={dropdown.toggleDropdownVisible}
                  label={this.props.needsRevised ?
                    <FormattedMessage {...messages.changeStatusOptions} /> :
                    <FormattedMessage {...messages.otherOptions} /> } />
             }
             dropdownContent={dropdown =>
               <ListMoreOptionsItems {...this.props} toggleDropdownVisible={dropdown.toggleDropdownVisible}/>
             }
           />
          }
        </div>
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
      {props.label}&hellip;
    </button>
  )
}

export const ListMoreOptionsItems = function(props) {
  let complete = props.complete
  if (props.needsRevised) {
    complete = (status) => props.complete(status, TaskReviewStatus.needed)
  }

  return (
    <ol className="mr-list-dropdown">
      {props.allowedProgressions.has(TaskStatus.falsePositive) && props.needsRevised &&
       <li onClick={props.toggleDropdownVisible}>
         <TaskFalsePositiveControl {...props} complete={complete} asLink />
       </li>
      }
      {props.allowedProgressions.has(TaskStatus.fixed) &&
       <li onClick={props.toggleDropdownVisible}>
         <TaskFixedControl {...props} complete={complete} asLink />
       </li>
      }
      {props.allowedProgressions.has(TaskStatus.tooHard) &&
       <li onClick={props.toggleDropdownVisible}>
         <TaskTooHardControl {...props} complete={complete} asLink />
       </li>
      }
      {props.allowedProgressions.has(TaskStatus.alreadyFixed) &&
       <li onClick={props.toggleDropdownVisible}>
         <TaskAlreadyFixedControl {...props} complete={complete} asLink />
       </li>
      }
    </ol>
  )
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
