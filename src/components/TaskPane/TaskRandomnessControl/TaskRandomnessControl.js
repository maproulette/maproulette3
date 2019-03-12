import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _isFinite from 'lodash/isFinite'
import { FormattedMessage } from 'react-intl'
import { TaskLoadMethod, messagesByLoadMethod }
       from '../../../services/Task/TaskLoadMethod/TaskLoadMethod'
import messages from './Messages'
import './TaskRandomnessControl.scss'

/**
 * TaskRandomnessControl displays a switch for toggling tracking of the current
 * task, saving/unsaving it into the user's set of saved tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskRandomnessControl extends Component {
  loadBy = loadMethod => {
    const isVirtual = _isFinite(this.props.virtualChallengeId)
    const challengeId = isVirtual ? this.props.virtualChallengeId :
                                    this.props.challengeId
    this.props.setTaskLoadBy(challengeId, isVirtual, loadMethod)
  }

  render() {
    if (!this.props.user || !this.props.task || !_isFinite(this.props.challengeId)) {
      return null
    }

    return (
      <div className="task-randomness-control">
        <div className="control">
          <div className="task-randomness-control__prompt">
            <FormattedMessage {...messages.taskLoadByLabel} />
          </div>

          <div className="task-randomness-control__options">
            <label className="radio">
              <input type="radio" name="randomnessPreference"
                    className="task-randomness-control__random-option"
                    checked={this.props.taskLoadBy === TaskLoadMethod.random}
                    onChange={() => this.loadBy(TaskLoadMethod.random)} />
              <FormattedMessage {...messagesByLoadMethod[TaskLoadMethod.random]} />
            </label>
            <label className="radio">
              <input type="radio" name="randomnessPreference"
                    className="task-randomness-control__proximity-option"
                    checked={this.props.taskLoadBy === TaskLoadMethod.proximity}
                    onChange={() => this.loadBy(TaskLoadMethod.proximity)} />
              <FormattedMessage {...messagesByLoadMethod[TaskLoadMethod.proximity]} />
            </label>
          </div>
        </div>
      </div>
    )
  }
}

TaskRandomnessControl.propTypes = {
  /** The current user */
  user: PropTypes.object,
  /** The current active challenge */
  challengeId: PropTypes.number,
  /** Current setting of whether to load tasks randomly or by proximity */
  taskLoadBy: PropTypes.string,
  /** Invoked if the user alters the load-by setting  */
  setTaskLoadBy: PropTypes.func.isRequired,
}
