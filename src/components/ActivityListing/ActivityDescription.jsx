import { Fragment } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _isFinite from 'lodash/isFinite'
import { ActivityItemType, messagesByType }
       from '../../services/Activity/ActivityItemTypes/ActivityItemTypes'
import { ActivityActionType, messagesByAction }
       from '../../services/Activity/ActivityActionTypes/ActivityActionTypes'
import { messagesByStatus }
       from '../../services/Task/TaskStatus/TaskStatus'
import ActivityTime from './ActivityTime'
import messages from './Messages'

/**
 * Displays a description of an activity entry. Primarily intended for use in
 * activity timelines, but also supports a simplified rendering suitable for
 * other uses via the simplified prop
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const ActivityDescription = props => {
  const challengeName =
    props.entry.typeId === ActivityItemType.task ?
    props.entry.parentName :
    null

  return (
    <div
      className={classNames(
        "mr-flex mr-flex-col",
        {"mr-timeline__period mr-timeline__period--vcentered": !props.simplified},
      )}
    >
      <div className="mr-flex mr-justify-between mr-items-center">
        <ActivityTime {...props} entry={props.entry} />
        {props.simplified ?
         <div className="mr-w-4"></div> :
         <div className="mr-border-b-2 mr-border-white-10 mr-w-48 mr-mx-2 mr-flex-grow"></div>
        }
        <Link to={`/user/metrics/${props.entry.user.id}`} className="mr-flex-grow-0">
          {props.entry.user.osmProfile.displayName}
        </Link>
      </div>
      <div className={props.simplified ? "mr-mt-2 mr-break-words" : "mr-mt-5 mr-text-base mr-break-words"}>
        <Link to={`/browse/challenges/${props.entry.parentId}`}>
          {challengeName}
        </Link>
      </div>
      {(props.entry?.challenge?.general?.parent?.id) &&
        <div className="mr-break-words mr-links-grey-light mr-mb-4">
          <Link
            to={`/browse/projects/${props.entry.challenge.general.parent.id}`}
            className={props.simplified ? "mr-text-xs" : "mr-text-sm"}
          >
            {props.entry.challenge.general.parent.displayName || props.entry.challenge.general.parent.name}
          </Link>
        </div>
      }
      <div>
        {_isFinite(props.entry.count) &&
         <span className="mr-badge mr-mr-2 mr-mt-1">{props.entry.count}</span>
        }
        <span>
          <FormattedMessage {...messagesByAction[props.entry.action]} />
        </span> <Link to={`/challenge/${props.entry.parentId}/task/${props.entry.itemId}`}>
          <FormattedMessage {...messagesByType[props.entry.typeId]} />
        </Link> {
          props.entry.action === ActivityActionType.taskStatusSet &&
          _isFinite(props.entry.status) && 
          <Fragment>
            <FormattedMessage
              {...messages.statusTo}
            /> <FormattedMessage
              {...messagesByStatus[props.entry.status]}
            />
          </Fragment>
        }
      </div>
    </div>
  );
}

ActivityDescription.propTypes = {
  entry: PropTypes.object.isRequired,
  simplified: PropTypes.bool,
}

ActivityDescription.defaultProps = {
  simplified: false,
}

export default ActivityDescription
