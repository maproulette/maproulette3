import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import VirtualChallengeNameLink
       from '../VirtualChallengeNameLink/VirtualChallengeNameLink'
import ChallengeNameLink from '../ChallengeNameLink/ChallengeNameLink'
import OwnerContactLink from '../OwnerContactLink/OwnerContactLink'

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
      <React.Fragment>
        <VirtualChallengeNameLink {...this.props} />

        <h2 className="active-task-details--name">
          <ChallengeNameLink {...this.props} />
        </h2>

        <div className="active-task-details--project-name">
          {_get(this.props.task, 'parent.parent.displayName')}
        </div>

        <OwnerContactLink {...this.props} />
      </React.Fragment>
    )
  }
}

ChallengeInfoSummary.propTypes = {
  task: PropTypes.object,
}
