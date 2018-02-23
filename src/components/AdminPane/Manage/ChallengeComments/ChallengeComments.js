import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import CommentList from '../../../CommentList/CommentList'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './ChallengeComments.css'

export default class ChallengeComments extends Component {
  render() {
    return (
      <div className="challenge-comments">
        <div className="challenge-comments__controls">
          <a target="_blank"
            href={`/api/v2/challenge/${_get(this.props, 'challenge.id')}/comments/extract`}
            className="button is-outlined is-secondary has-svg-icon export-control">
            <SvgSymbol sym='download-icon' viewBox='0 0 20 20' />
            <FormattedMessage {...messages.exportLabel} />
          </a>
        </div>

        <CommentList includeTaskLinks
                     comments={_get(this.props, 'challenge.comments', [])} />
      </div>
    )
  }
}

ChallengeComments.propTypes = {
  /** The challenge for which comments are to be displayed */
   challenge: PropTypes.object.isRequired,
}
