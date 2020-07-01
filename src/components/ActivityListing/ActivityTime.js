import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
  injectIntl,
  FormattedRelativeTime,
  FormattedDate,
  FormattedTime
} from 'react-intl'
import { selectUnit } from '@formatjs/intl-utils'
import parse from 'date-fns/parse'

/**
 * Displays the timestamp for an activity entry, either relative or exact
 * depending on value of showExactDates prop
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const ActivityTime = props => {
  const timestamp = parse(props.entry.created)
  const created = `${props.intl.formatDate(timestamp)} ${props.intl.formatTime(timestamp)}`
  return (
    <div
      className={classNames(
        "mr-whitespace-no-wrap mr-leading-tight mr-capitalize mr-flex-grow-0",
        {"mr-text-yellow": !props.simplified}
      )}
      title={created}
    >
      {props.showExactDates ?
       <span>
         <FormattedDate value={props.entry.created} /> <FormattedTime value={props.entry.created} />
       </span> :
       <FormattedRelativeTime {...selectUnit(timestamp)} />
      }
    </div>
  )
}

ActivityTime.propTypes = {
  entry: PropTypes.object.isRequired,
  showExactDates: PropTypes.bool,
}

ActivityTime.defaultProps = {
  showExactDates: false,
}

export default injectIntl(ActivityTime)
