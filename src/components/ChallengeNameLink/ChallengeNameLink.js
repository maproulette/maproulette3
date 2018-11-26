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
    const challengeBrowseRoute =
      `/browse/challenges/${_get(this.props.task, 'parent.id', '')}`

    return (
      <React.Fragment>
        <Link to={challengeBrowseRoute}>
          <span className="mr-mr-2">
            {_get(this.props.task, 'parent.name')}
          </span>
        </Link>
        <ShareLink link={challengeBrowseRoute} {...this.props} />
      </React.Fragment>
    )
  }
}

ChallengeNameLink.propTypes = {
  task: PropTypes.object,
}
