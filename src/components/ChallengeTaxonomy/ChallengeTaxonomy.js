import React from 'react'
import { FormattedMessage } from 'react-intl'
import messages from './Messages'

/**
 * Displays the taxonomical categories of a challenge, e.g. popular, featured,
 * quick-fix, saved, etc.
 */
const ChallengeTaxonomy = props => {
  if (!props.isSaved &&
      !props.challenge.featured &&
      !props.challenge.popular &&
      !props.challenge.newest &&
      !props.challenge.hasSuggestedFixes) {
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
      {props.challenge.featured &&
      <li>
        <span className="mr-text-turquoise">
          <FormattedMessage {...messages.featuredLabel} />
        </span>
      </li>
      }
      {props.challenge.popular &&
      <li>
        <span className="mr-text-orange">
          <FormattedMessage {...messages.popularLabel} />
        </span>
      </li>
      }
      {props.challenge.newest &&
      <li>
        <span className="mr-text-yellow">
          <FormattedMessage {...messages.newestLabel} />
        </span>
      </li>
      }
      {props.challenge.hasSuggestedFixes &&
      <li>
        <span className="mr-text-rosebud">
          <FormattedMessage {...messages.suggestedFixLabel} />
        </span>
      </li>
      }
    </ul>
  )
}

export default ChallengeTaxonomy
