import React from 'react'
import { FormattedMessage } from 'react-intl'
import { isCooperative, messagesByCooperativeType }
       from '../../services/Challenge/CooperativeType/CooperativeType'
import messages from './Messages'

/**
 * Displays the taxonomical categories of a challenge or project, e.g. popular,
 * featured, cooperative, saved, etc.
 */
const Taxonomy = props => {
  if (!props.isSaved &&
      !props.featured &&
      !props.popular &&
      !props.newest &&
      !isCooperative(props.cooperativeType)) {
    return null
  }

  return (
    <ul className="mr-card-challenge__taxonomy">
      {props.isSaved &&
      <li>
        <span className="mr-text-pink-light">
          <FormattedMessage {...messages.savedLabel} />
        </span>
      </li>
      }
      {props.featured &&
      <li>
        <span className="mr-text-turquoise">
          <FormattedMessage {...messages.featuredLabel} />
        </span>
      </li>
      }
      {props.popular &&
      <li>
        <span className="mr-text-orange">
          <FormattedMessage {...messages.popularLabel} />
        </span>
      </li>
      }
      {props.newest &&
      <li>
        <span className="mr-text-yellow">
          <FormattedMessage {...messages.newestLabel} />
        </span>
      </li>
      }
      {isCooperative(props.cooperativeType) &&
      <li>
        <span className="mr-text-rosebud">
          <FormattedMessage {...messagesByCooperativeType[props.cooperativeType]} />
        </span>
      </li>
      }
    </ul>
  )
}

export default Taxonomy
