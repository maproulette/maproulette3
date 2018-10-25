import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _flatMap from 'lodash/flatMap'
import _compact from 'lodash/compact'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import CommentList from '../../../../CommentList/CommentList'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import QuickBlock from '../QuickBlock'
import messages from './Messages'
import './CommentsBlock.css'

const descriptor = {
  blockKey: 'CommentsBlock',
  label: "Comments",
  targets: [DashboardDataTarget.challenges, DashboardDataTarget.challenge],
  defaultWidth: 4,
  defaultHeight: 12,
}

export class CommentsBlock extends Component {
  render() {
    const comments = _compact(_flatMap(this.props.challenges, challenge =>
      challenge.comments ?
      _map(challenge.comments, comment => Object.assign({challengeName: challenge.name}, comment)) :
      null
    ))

    let exportControl = null

    // Comments can only be exported for single challenges.
    if (comments.length > 0 && _get(this.props, 'challenges.length', 0) === 1) {
      exportControl = (
        <a target="_blank"
           href={`/api/v2/challenge/${_get(this.props, 'challenge.id')}/comments/extract`}
           className="button is-outlined is-green has-svg-icon export-control">
          <SvgSymbol sym='download-icon' viewBox='0 0 20 20' />
          <FormattedMessage {...messages.exportLabel} />
        </a>
      )
    }

    return (
      <QuickBlock {...this.props}
                  className="comments-block"
                  blockTitle={<FormattedMessage {...messages.title} />}
                  titleControls={exportControl}>
        <CommentList includeChallengeNames={_get(this.props, 'challenges.length', 0) > 1}
                     includeTaskLinks
                     comments={comments} />
      </QuickBlock>
    )
  }
}

registerBlockType(CommentsBlock, descriptor)
