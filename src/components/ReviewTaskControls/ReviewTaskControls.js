import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _pick from 'lodash/pick'
import _omit from 'lodash/omit'
import AsManager from '../../interactions/User/AsManager'
import WithSearch from '../HOCs/WithSearch/WithSearch'
import WithKeyboardShortcuts
       from '../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import TaskEditControl
       from '../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskEditControl/TaskEditControl'
import UserEditorSelector
       from '../UserEditorSelector/UserEditorSelector'
import messages from './Messages'
import './ReviewTaskControls.scss'

/**
 * ReviewTaskControls presents controls used during task review by a challenge
 * owner, primarily navigation controls for moving to the next or previous
 * sequential task in the challenge, but also controls for opening the task in
 * an editor or modifying the task data.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ReviewTaskControls extends Component {
  /** Navigate to the previous sequential task */
  prevTask = () => {
    this.props.previousSequentialTask(this.props.task, this.state.comment)
  }

  /** Navigate to the next sequential task */
  nextTask = () => {
    this.props.nextSequentialTask(this.props.task, this.state.comment)
  }

  /** Process keyboard shortcuts for the review controls */
  handleKeyboardShortcuts = (event) => {
    if (this.props.textInputActive(event)) { // ignore typing in inputs
      return
    }

    const reviewShortcuts = this.props.keyboardShortcutGroups.taskReview
    if (event.key === reviewShortcuts.prevTask.key) {
      this.prevTask()
    }
    else if (event.key === reviewShortcuts.nextTask.key) {
      this.nextTask()
    }
  }

  /** Open the task in an editor */
  pickEditor = ({ value }) => {
    this.props.editTask(value, this.props.task, this.props.mapBounds)
  }

  modifyTaskRoute = () => {
    return `/admin/project/${this.props.task.parent.parent.id}/` +
      `challenge/${this.props.task.parent.id}/task/${this.props.task.id}/edit`
  }

  componentDidMount() {
    this.props.activateKeyboardShortcutGroup(
      _pick(this.props.keyboardShortcutGroups, 'taskReview'),
      this.handleKeyboardShortcuts
    )
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcutGroup('taskReview',
                                               this.handleKeyboardShortcuts)
  }
  render() {
    const manager = AsManager(this.props.user)

    return (
      <div className={classNames("review-task-controls", this.props.className)}>
        <UserEditorSelector {...this.props} className="mr-mb-4" />
        <div className="mr-my-4 mr-grid mr-grid-columns-2 mr-grid-gap-4">
          <TaskEditControl pickEditor={this.pickEditor}
                            className="active-task-controls__edit-control"
                            {..._omit(this.props, 'className')} />

          {manager.canWriteProject(this.props.task.parent.parent) ?
           <Link
             to={{pathname: this.modifyTaskRoute(), state: {fromTaskReview: true}}}
             className="mr-button"
           >
             <FormattedMessage {...messages.modifyTaskLabel} />
           </Link> : <div />
          }
          <button className="mr-button mr-button--white" onClick={this.prevTask}>
            <FormattedMessage {...messages.previousTaskLabel} />
          </button>

          <button className="mr-button mr-button--white" onClick={this.nextTask}>
            <FormattedMessage {...messages.nextTaskLabel} />
          </button>
        </div>
      </div>
    )
  }
}

ReviewTaskControls.propTypes = {
  /** The task being reviewed */
  task: PropTypes.object,
  /** Invoked when the user clicks the previous-task button */
  previousSequentialTask: PropTypes.func.isRequired,
  /** Invoked when the user clicks the next-task button */
  nextSequentialTask: PropTypes.func.isRequired,
}

export default WithSearch(WithKeyboardShortcuts(ReviewTaskControls), 'task')
