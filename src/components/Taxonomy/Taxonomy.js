import React from 'react'
import { FormattedMessage } from 'react-intl'
import messages from './Messages'

/**
 * Displays the taxonomical categories of a challenge or project, e.g. popular,
 * featured, quick-fix, saved, etc.
 */
const Taxonomy = props => {
  if (!props.isSaved &&
      !props.featured &&
      !props.popular &&
      !props.newest &&
      !props.hasSuggestedFixes) {
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
      {props.hasSuggestedFixes &&
      <li>
        <span className="mr-text-rosebud">
          <FormattedMessage {...messages.suggestedFixLabel} />
        </span>
      </li>
      }
    </ul>
  )
}

export default Taxonomy
