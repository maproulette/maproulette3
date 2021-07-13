import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import VirtualChallengeNameLink
       from '../VirtualChallengeNameLink/VirtualChallengeNameLink'
import ChallengeNameLink from '../ChallengeNameLink/ChallengeNameLink'
import OwnerContactLink, { JoinChallengeDiscussionLink } from '../ChallengeOwnerContactLink/ChallengeOwnerContactLink'

/**
 * ChallengeInfoSummary displays various pieces of summary information about
 * the parent challenge of the given task, such as its name, parent project
 * name, owner contact, and the current virtual challenge name (if any).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ChallengeInfoSummary extends Component {
  render() {
    return (
      <div className="challenge-info-summary">
        <VirtualChallengeNameLink {...this.props} />

        <h1 className="mr-h2 mr-links-green-lighter mr-flex mr-items-center">
          <span className="mr-mr-2">
            <ChallengeNameLink {...this.props} />
          </span>
        </h1>

        <ul className="mr-list-ruled mr-text-grey-light mr-text-xs">
          <li>
            <span className="mr-text-current">
              {_get(this.props.task, 'parent.parent.displayName')}
            </span>
          </li>

          <li className="mr-links-green-lighter">
            <OwnerContactLink {...this.props} />
          </li>

          <li className="mr-links-green-lighter">
            <JoinChallengeDiscussionLink {...this.props} />
          </li>
        </ul>
      </div>
    )
  }
}

ChallengeInfoSummary.propTypes = {
  task: PropTypes.object,
}
