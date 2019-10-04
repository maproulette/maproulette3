import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
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

  toggleMoreOptions = () => {
    this.setState({moreOptionsOpen: !this.state.moreOptionsOpen})
  }

  closeMoreOptions = () => {
    this.setState({moreOptionsOpen: false})
  }

  render() {
    return (
      <div>
        {this.props.needsRevised &&
          <div className="mr-text-white mr-text-md mr-mt-4">
            <div>
              <FormattedMessage {...messages.revisionNeeded} />

            </div>
          </div>
        }

        <UserEditorSelector {...this.props} className="mr-mb-4" />
        <div className="mr-my-4 mr-grid mr-grid-columns-2 mr-grid-gap-4">
          {(this.props.allowedProgressions.has(TaskStatus.fixed) || this.props.needsRevised) &&
           <TaskEditControl {...this.props} />
          }

          {this.props.allowedProgressions.has(TaskStatus.falsePositive) &&
           <TaskFalsePositiveControl {...this.props} />
          }

          {this.props.allowedProgressions.has(TaskStatus.skipped) &&
           <TaskSkipControl {...this.props} />
          }

          {(this.props.allowedProgressions.has(TaskStatus.fixed) ||
            this.props.allowedProgressions.has(TaskStatus.tooHard) ||
            this.props.allowedProgressions.has(TaskStatus.alreadyFixed)) &&
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

          {this.props.needsRevised &&
            <TaskRevisedControl {...this.props} className="" />
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
      Other&hellip;
    </button>
  )
}

const ListMoreOptionsItems = function(props) {
  return (
    <ol className="mr-list-dropdown">
      {props.allowedProgressions.has(TaskStatus.fixed) &&
       <li>
         <TaskFixedControl {...props} asLink />
       </li>
      }
      {props.allowedProgressions.has(TaskStatus.tooHard) &&
       <li>
         <TaskTooHardControl {...props} asLink />
       </li>
      }
      {props.allowedProgressions.has(TaskStatus.alreadyFixed) &&
       <li>
         <TaskAlreadyFixedControl {...props} asLink />
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
