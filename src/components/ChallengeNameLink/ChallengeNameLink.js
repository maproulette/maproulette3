import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import { Link } from 'react-router-dom'
import ShareLink from '../ShareLink/ShareLink'

/**
 * ChallengeNameLink displays a linked name of the parent challenge of the
 * given task, along with a share link.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ChallengeNameLink extends Component {
  render() {
    const challenge = _get(this.props.task, 'parent') || this.props.challenge || {}
    const challengeBrowseRoute =
      `/browse/challenges/${challenge.id}`

    return (
      <span className="mr-flex mr-items-center mr-relative">
        <Link to={challengeBrowseRoute}>
          <span className="mr-mr-2">
            {challenge.name}
          </span>
        </Link>
        <ShareLink link={challengeBrowseRoute} {...this.props} />
      </span>
    )
  }
}

ChallengeNameLink.propTypes = {
  task: PropTypes.object,
}
