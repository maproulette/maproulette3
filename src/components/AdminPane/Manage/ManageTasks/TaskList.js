import React from 'react'
import _map from 'lodash/map'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import { messagesByPriority }
       from '../../../../services/Challenge/ChallengePriority/ChallengePriority'
import messages from './Messages'

/**
 * TaskList renders the list of given tasks for the given challenge
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const TaskList = function(props) {
  return _map(props.tasks, task => {
    const taskBaseRoute =
      `/admin/project/${props.challenge.parent.id}` +
      `/challenge/${props.challenge.id}/task/${task.id}`

    return (
      <div className='item-entry' key={task.id}>
        <div className='columns list-item task-list-item'>
          <div className='column item-id'>{task.id}</div>

          <div className='column item-priority'>
            <FormattedMessage {...messagesByPriority[task.priority]} />
          </div>

          <div className='column item-name'>
            <Link to={`${taskBaseRoute}/review`}>{task.name}</Link>
          </div>

          <div className='column is-narrow has-text-right controls edit-control'>
            <Link to={`${taskBaseRoute}/edit`}
                  title={props.intl.formatMessage(messages.editTaskTooltip)}>
              <FormattedMessage {...messages.editTaskLabel} />
            </Link>
          </div>
        </div>
      </div>
    )
  })
}

export default TaskList
