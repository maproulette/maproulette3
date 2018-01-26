import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { get as _get, omit as _omit } from 'lodash'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import DropdownButton from '../../../../Bulma/DropdownButton'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import { Editor } from '../../../../../services/Editor/Editor'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
import WithDeactivateOnOutsideClick
       from '../../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import TaskCommentInput from '../TaskCommentInput/TaskCommentInput'
import SignInButton from '../../../../SignInButton/SignInButton'
import TaskSaveControls from '../TaskSaveControls/TaskSaveControls'
import messages from './Messages'
import './TaskEditControls.css'

// Setup child components with needed HOCs.
const DeactivatableDropdownButton = WithDeactivateOnOutsideClick(DropdownButton)

/**
 * TaskEditControls renders and manages controls and keyboard shortcuts for
 * initiating editing a task (fix, skip, false positive).
 *
 * > Note that if the user is not logged in, a sign-in button will be rendered
 * > instead of controls.
 *
 * @see See TaskCompletionControls for following-up on a fix action.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskEditControls extends Component {
  /** Choose which editor to launch for fixing a task */
  pickEditor = ({ value }) => {
    this.props.setTaskBeingCompleted(this.props.task.id)
    this.props.editTask(value, this.props.task, this.props.mapBounds.task)
  }

  /** Mark the task as complete with the given status */
  complete = (taskStatus) => {
    this.props.setTaskBeingCompleted(this.props.task.id)
    this.props.completeTask(this.props.task.id, this.props.task.parent.id,
                            taskStatus, this.props.comment)
  }

  /** Process keyboard shortcuts for the edit controls */
  handleKeyboardShortcuts = (event) => {
    // Ignore typing in inputs.
    if (event.target.nodeName.toLowerCase() === 'input') {
      return
    }

    const editShortcuts = this.props.keyboardShortcutGroups.taskEditing

    switch(event.key) {
      case editShortcuts.editId.key:
        this.pickEditor({value: Editor.id})
        break
      case editShortcuts.editJosm.key:
        this.pickEditor({value: Editor.josm})
        break
      case editShortcuts.editJosmLayer.key:
        this.pickEditor({value: Editor.josmLayer})
        break
      case editShortcuts.falsePositive.key:
        this.complete(TaskStatus.falsePositive)
        break
      case editShortcuts.skip.key:
        this.complete(TaskStatus.skipped)
        break
      default:
    }
  }

  componentDidMount() {
    this.props.activateKeyboardShortcuts(this.props.keyboardShortcutGroups.taskEditing,
                                         this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcuts(this.props.keyboardShortcutGroups.taskEditing,
                                           this.handleKeyboardShortcuts)
  }

  render() {
    // If the user is not logged in, show a sign-in button instead of controls.
    if (!_get(this.props, 'user.isLoggedIn')) {
      return (
        <div className={classNames('task-edit-controls', this.props.className,
                                   {'is-minimized': this.props.isMinimized})}>
          <div className="has-centered-children">
            <SignInButton className="task-edit-controls--signin" {...this.props} />
          </div>
        </div>
      )
    }

    // If the user has a favorite editor, open that immediately when they click
    // the edit control. Otherwise show a dropdown of choices.
    const defaultEditor = _get(this.props, 'user.settings.defaultEditor', Editor.none)
    let editControl = null
    if (defaultEditor !== Editor.none) {
      editControl = (
        <button className={classNames("button task-edit-controls__edit-control",
                                      {"large-and-wide": !this.props.isMinimized,
                                       "icon-only": this.props.isMinimized})}
                onClick={() => this.pickEditor({value: defaultEditor})}>
          <span className="control-icon"
                title={this.props.intl.formatMessage(messages.fix)}>
            <SvgSymbol viewBox='0 0 20 20' sym="edit-icon" />
          </span>
          <span className="control-label">
            <FormattedMessage {...messages.fix} />
          </span>
        </button>
      )
    }
    else {
      const editorOptions = [
        {key: Editor.id, text: 'Edit in iD', value: Editor.id},
        {key: Editor.josm, text: 'Edit in JOSM', value: Editor.josm},
        {key: Editor.josmLayer, text: 'Edit in new JOSM layer', value: Editor.josmLayer}
      ]

      editControl = (
        <DeactivatableDropdownButton className={classNames('task-edit-controls__editor-dropdown',
                                                           {'popout-right': this.props.isMinimized})}
                                     options={editorOptions} onSelect={this.pickEditor}>
          <button className={classNames("button task-edit-controls__edit-control",
                                        {"large-and-wide": !this.props.isMinimized,
                                         "icon-only": this.props.isMinimized})}>
            <span className="control-icon"
                  title={this.props.intl.formatMessage(messages.fix)}>
              <SvgSymbol viewBox='0 0 20 20' sym="edit-icon" />
            </span>
            <span className="control-label">
              <FormattedMessage {...messages.fix} />
            </span>
          </button>
        </DeactivatableDropdownButton>
      )
    }

    return (
      <div className={classNames('task-edit-controls', this.props.className,
                                 {'is-minimized': this.props.isMinimized})}>

        <TaskCommentInput className="task-edit-controls__task-comment"
                          value={this.props.comment}
                          commentChanged={this.props.setComment}
                          {..._omit(this.props, 'className')} />

        <div className="task-edit-controls__control-block">
          {editControl}

          <button className={classNames("button task-edit-controls__false-positive-control",
                                        {"large-and-wide": !this.props.isMinimized,
                                        "icon-only": this.props.isMinimized})}
                  onClick={() => this.complete(TaskStatus.falsePositive)}>
            <span className="control-icon"
                  title={this.props.intl.formatMessage(messages.falsePositive)}>
              <SvgSymbol viewBox='0 0 20 20' sym="check-icon" />
            </span>
            <span className="control-label">
              <FormattedMessage {...messages.falsePositive} />
            </span>
          </button>

          <button className={classNames("button task-edit-controls__skip-control",
                                        {"large-and-wide": !this.props.isMinimized,
                                        "icon-only": this.props.isMinimized})}
                  onClick={() => this.complete(TaskStatus.skipped)}>
            <span className="control-icon"
                  title={this.props.intl.formatMessage(messages.skip)}>
              <SvgSymbol viewBox='0 0 20 20' sym="skip-icon" />
            </span>
            <span className="control-label">
              <FormattedMessage {...messages.skip} />
            </span>
          </button>

          <TaskSaveControls {..._omit(this.props, 'className')} />
        </div>
      </div>
    )
  }
}

TaskEditControls.propTypes = {
  /** The current user, if any */
  user: PropTypes.object,
  /** The current active task */
  task: PropTypes.object.isRequired,
  /** The current map bounds (for editing) */
  mapBounds: PropTypes.object,
  /** The current completion comment */
  comment: PropTypes.string,
  /** Invoked if the user wishes to edit the task */
  editTask: PropTypes.func.isRequired,
  /** Invoked if the user immediately completes the task (false positive) */
  completeTask: PropTypes.func.isRequired,
  /** Invoked if the user initiates the task completion process */
  setTaskBeingCompleted: PropTypes.func.isRequired,
  /** Invoked to set a completion comment */
  setComment: PropTypes.func.isRequired,
  /** The keyboard shortcuts to be offered on this step */
  keyboardShortcutGroups: PropTypes.object.isRequired,
  /** Invoked when keyboard shortcuts are to be active */
  activateKeyboardShortcuts: PropTypes.func.isRequired,
  /** Invoked when keyboard shortcuts should no longer be active  */
  deactivateKeyboardShortcuts: PropTypes.func.isRequired,
}

TaskEditControls.defaultProps = {
  comment: "",
}
