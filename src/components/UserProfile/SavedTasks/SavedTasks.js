import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import _isFinite from 'lodash/isFinite'
import { Link } from 'react-router-dom'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * SavedTasks renders a list of tasks that the user has previously
 * saved while editing. Clicking on a task routes the user to that
 * task.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class SavedTasks extends Component {
  render() {
    const taskItems =
      _compact(_map(_get(this.props, 'user.savedTasks', []), task => {
        if (!_isFinite(_get(task, 'parent.id'))) {
          return null
        }

        return (
          <li key={task.id} className="user-profile__saved-tasks__task">
            <Link to={`/challenge/${task.parent.id}/task/${task.id}`}>
              <span className="saved-tasks__task__name">{task.name}</span> &mdash; {task.parent.name}
            </Link>

            <span className="connector" />

            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className='button is-clear'
               onClick={() => this.props.unsaveTask(this.props.user.id, task.id)}
               title={this.props.intl.formatMessage(messages.unsave)}>
              <SvgSymbol className='icon' sym='trash-icon' viewBox='0 0 20 20' />
            </a>
          </li>
        )
      }
    ))

    const savedTasks = taskItems.length > 0 ?
                       <ul>{taskItems}</ul> :
                       <div className="none">No Tasks</div>

    return (
      <div className={classNames("user-profile__saved-tasks", this.props.className)}>
        <h2 className="subtitle">
          <FormattedMessage {...messages.header} />
        </h2>

        {savedTasks}
      </div>
    )
  }
}

SavedTasks.propTypes = {
  user: PropTypes.object.isRequired,
}
