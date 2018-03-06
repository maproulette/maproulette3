import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
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
      _map(_get(this.props, 'user.savedTasks', []), task =>
        <li key={task.id} className="columns saved-tasks__task">
          <div className="column is-four-fifths">
            <Link to={`/challenge/${task.parent.id}/task/${task.id}`}>
              {task.name} &mdash; {task.parent.name}
            </Link>
          </div>

          <div className="column">
            <a className='button is-clear'
               onClick={() => this.props.unsaveTask(this.props.user.id, task.id)}
               title={this.props.intl.formatMessage(messages.unsave)}>
              <SvgSymbol className='icon' sym='trash-icon' viewBox='0 0 20 20' />
            </a>
          </div>
        </li>
      )

    const savedTasks = taskItems.length > 0 ?
                       <ul>{taskItems}</ul> :
                       <div className="none">No Tasks</div>

    return (
      <div className={classNames("saved-tasks", this.props.className)}>
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
