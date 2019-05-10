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
import './CommentsWidget.scss'

const descriptor = {
  widgetKey: 'CommentsWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenges, WidgetDataTarget.challenge],
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
        <a target="_blank"
           rel="noopener noreferrer"
           href={`${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/challenge/${_get(this.props, 'challenge.id')}/comments/extract`}
           className="button is-outlined is-green has-svg-icon export-control">
          <SvgSymbol sym='download-icon' viewBox='0 0 20 20' />
          <FormattedMessage {...messages.exportLabel} />
        </a>
      )
    }

    return (
      <QuickWidget {...this.props}
                  className="comments-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}
                  headerControls={exportControl}>
        <CommentList includeChallengeNames={_get(this.props, 'challenges.length', 0) > 1}
                     includeTaskLinks
                     lightMode={this.props.lightMode}
                     comments={comments} />
      </QuickWidget>
    )
  }
}

registerWidgetType(CommentsWidget, descriptor)
