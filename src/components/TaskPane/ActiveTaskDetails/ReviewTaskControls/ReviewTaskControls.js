import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _pick from 'lodash/pick'
import _omit from 'lodash/omit'
import WithMapBounds from '../../../HOCs/WithMapBounds/WithMapBounds'
import WithKeyboardShortcuts
       from '../../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import TaskEditControl from '../ActiveTaskControls/TaskEditControl/TaskEditControl'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './ReviewTaskControls.css'

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
  prevTask = () =>
    this.props.previousSequentialTask(this.props.task)

  /** Navigate to the next sequential task */
  nextTask = () =>
    this.props.nextSequentialTask(this.props.task)

  /** Process keyboard shortcuts for the review controls */
  handleKeyboardShortcuts = (event) => {
    // Ignore typing in inputs.
    if (event.target.nodeName.toLowerCase() === 'input') {
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
    this.props.editTask(value, this.props.task, this.props.mapBounds.task)
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
    return (
      <div className={classNames("review-task-controls", this.props.className)}>
        <div className="review-task-controls__control-block">
          <button className="button previous-task-control large-and-wide"
                  onClick={this.prevTask}>
            <span className="control-icon">
              <SvgSymbol viewBox='0 0 20 20' sym="back-icon" />
            </span>
            <span className="control-label">
              <FormattedMessage {...messages.previousTaskLabel} />
            </span>
          </button>

          <button className="button large-and-wide next-task-control"
                  onClick={this.nextTask}>
            <span className="control-label">
              <FormattedMessage {...messages.nextTaskLabel} />
            </span>
            <span className="control-icon">
              <SvgSymbol viewBox='0 0 20 20' sym="forward-icon" />
            </span>
          </button>
        </div>
        <div className="review-task-controls__control-block">
          <TaskEditControl pickEditor={this.pickEditor}
                           className="active-task-controls__edit-control"
                           {..._omit(this.props, 'className')} />
        </div>
        <div className="review-task-controls__control-block">
          <Link to={{pathname: this.modifyTaskRoute(), state: {fromTaskReview: true}}}
                className="button large-and-wide full-width modify-task-control">
            <FormattedMessage {...messages.modifyTaskLabel} />
          </Link>
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

export default WithMapBounds(WithKeyboardShortcuts(ReviewTaskControls))
