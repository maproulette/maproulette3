import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _flatMap from 'lodash/flatMap'
import _compact from 'lodash/compact'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import CommentList from '../../../../CommentList/CommentList'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'CommentsWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenges, WidgetDataTarget.challenge, WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 12,
}

export default class CommentsWidget extends Component {
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
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/challenge/${_get(this.props, 'challenge.id')}/comments/extract`}
          className="mr-button mr-button--green-lighter mr-button--small mr-button--with-icon mr-text-sm"
        >
          <SvgSymbol
            sym='download-icon'
            viewBox='0 0 20 20'
            className="mr-h-3 mr-w-3 mr-fill-current mr-mr-2"
          />
          <FormattedMessage {...messages.exportLabel} />
        </a>
      )
    }

    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
        rightHeaderControls={<div className="mr-my-2">{exportControl}</div>}
      >
        <CommentList
          includeChallengeNames={_get(this.props, 'challenges.length', 0) > 1}
          includeTaskLinks
          lightMode={this.props.lightMode}
          comments={comments}
        />
      </QuickWidget>
    )
  }
}

registerWidgetType(CommentsWidget, descriptor)
