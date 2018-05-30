import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { Link } from 'react-router-dom'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import ShareLink from '../../ShareLink/ShareLink'
import messages from './Messages'

/**
 * VirtualChallengeNameLink displays a linked name of the given virtual
 * challenge, along with a share link.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class VirtualChallengeNameLink extends Component {
  render() {
    if (!_isFinite(this.props.virtualChallengeId)) {
      return null
    }

    const virtualChallengeBrowseRoute =
      `/browse/virtual/${this.props.virtualChallengeId}`

    return (
      <div className="active-task-details--virtual-name">
        <span className="active-task-details__virtual-badge"
              title={this.props.intl.formatMessage(messages.virtualChallengeTooltip)}>
          <SvgSymbol viewBox='0 0 20 20' sym="shuffle-icon" />
        </span>
        <h3>
          <Link to={virtualChallengeBrowseRoute}>
            {_get(this.props, 'virtualChallenge.name')}
          </Link>
          <ShareLink link={virtualChallengeBrowseRoute} {...this.props}
                     className="active-task-details--quick-share-link" />
        </h3>
      </div>
    )
  }
}

VirtualChallengeNameLink.propTypes = {
  virtualChallengeId: PropTypes.number,
  virtualChallenge: PropTypes.object,
}
