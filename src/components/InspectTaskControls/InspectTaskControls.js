import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _pick from 'lodash/pick'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import BusySpinner from '../BusySpinner/BusySpinner'
import { OPEN_STREET_MAP } from '../../services/VisibleLayer/LayerSources'
import AsManager from '../../interactions/User/AsManager'
import WithSearch from '../HOCs/WithSearch/WithSearch'
import WithChallengePreferences
       from '../HOCs/WithChallengePreferences/WithChallengePreferences'
import WithVisibleLayer from '../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithKeyboardShortcuts
       from '../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import TaskEditControl
       from '../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskEditControl/TaskEditControl'
import UserEditorSelector
       from '../UserEditorSelector/UserEditorSelector'
import messages from './Messages'
import './InspectTaskControls.scss'

const shortcutGroup = 'taskInspect'

/**
 * InspectTaskControls presents controls used during task inspect by a challenge
 * owner, primarily navigation controls for moving to the next or previous
 * sequential task in the challenge, but also controls for opening the task in
 * an editor or modifying the task data.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class InspectTaskControls extends Component {
  /** Navigate to the previous sequential task */
  prevTask = () => {
    this.props.previousSequentialTask(this.props.task)
  }

  /** Navigate to the next sequential task */
  nextTask = () => {
    this.props.nextSequentialTask(this.props.task)
  }

  /** Process keyboard shortcuts for the inspect controls */
  handleKeyboardShortcuts = (event) => {
    // Ignore if shortcut group is not active
    if (_isEmpty(this.props.activeKeyboardShortcuts[shortcutGroup])) {
      return
    }

    if (this.props.textInputActive(event)) { // ignore typing in inputs
      return
    }

    const inspectShortcuts = this.props.keyboardShortcutGroups[shortcutGroup]
    if (event.key === inspectShortcuts.prevTask.key) {
      this.prevTask()
    }
    else if (event.key === inspectShortcuts.nextTask.key) {
      this.nextTask()
    }
  }

  /** Open the task in an editor */
  pickEditor = ({ value }) => {
    this.props.editTask(
      value,
      this.props.task,
      this.props.mapBounds,
      {
        imagery: this.props.source.id !== OPEN_STREET_MAP ? this.props.source : undefined,
        photoOverlay: this.props.showMapillaryLayer ? 'mapillary' : null,
      },
      this.props.taskBundle
    )
  }

  modifyTaskRoute = () => {
    return `/admin/project/${this.props.task.parent.parent.id}/` +
      `challenge/${this.props.task.parent.id}/task/${this.props.task.id}/edit`
  }

  componentDidMount() {
    this.props.activateKeyboardShortcutGroup(
      _pick(this.props.keyboardShortcutGroups, shortcutGroup),
      this.handleKeyboardShortcuts
    )
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcutGroup(shortcutGroup,
                                               this.handleKeyboardShortcuts)
  }
  render() {
    const manager = AsManager(this.props.user)
    if (!_get(this.props, 'task.parent.parent')) {
      return (
        <div className="inspect-task-controls">
          <BusySpinner />
        </div>
      )
    }

    return (
      <div className="inspect-task-controls">
        {this.props.taskReadOnly ?
         <div className="mr-mt-4 mr-text-lg mr-text-pink-light">
           <FormattedMessage {...messages.readOnly} />
         </div> :
         <UserEditorSelector {...this.props} className="mr-mb-4" />
        }
        <div className="mr-my-4 mr-grid mr-grid-columns-2 mr-grid-gap-4">
          {!this.props.taskReadOnly ?
           <TaskEditControl
             pickEditor={this.pickEditor}
             className="active-task-controls__edit-control"
             {..._omit(this.props, 'className')}
           /> :
           <div />
          }

          {!this.props.taskReadOnly && manager.canWriteProject(_get(this.props, 'task.parent.parent')) ?
           <Link
             to={{pathname: this.modifyTaskRoute(), state: {fromTaskInspect: true}}}
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

InspectTaskControls.propTypes = {
  /** The task being inspected */
  task: PropTypes.object,
  /** Invoked when the user clicks the previous-task button */
  previousSequentialTask: PropTypes.func.isRequired,
  /** Invoked when the user clicks the next-task button */
  nextSequentialTask: PropTypes.func.isRequired,
}

export default WithSearch(
  WithChallengePreferences(
    WithVisibleLayer(
      WithKeyboardShortcuts(
        InspectTaskControls
      )
    )
  ),
  'task'
)
