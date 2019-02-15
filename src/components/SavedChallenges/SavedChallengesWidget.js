import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import _isFinite from 'lodash/isFinite'
import { Link } from 'react-router-dom'
import { WidgetDataTarget, registerWidgetType }
       from '../../services/Widget/Widget'
import QuickWidget from '../QuickWidget/QuickWidget'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'

const descriptor = {
  widgetKey: 'SavedChallengesWidget',
  label: messages.header,
  targets: [
    WidgetDataTarget.user,
  ],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 2,
  defaultHeight: 5,
}

export default class SavedChallengesWidget extends Component {
  componentDidMount() {
    if (this.props.user && this.props.fetchSavedChallenges) {
      this.props.fetchSavedChallenges(this.props.user.id)
    }
  }

  render() {
    return (
      <QuickWidget
        {...this.props}
        className="saved-challenges-widget"
        widgetTitle={<FormattedMessage {...messages.header} />}
      >
        <SavedChallengeList {...this.props} />
      </QuickWidget>
    )
  }
}

const SavedChallengeList = function(props) {
  const challengeItems =
    _compact(_map(_get(props, 'user.savedChallenges', []), challenge => {
      if (!_isFinite(_get(challenge, 'id'))) {
        return null
      }

      return (
        <li key={challenge.id} className="mr-mb-2 mr-flex mr-items-center">
          <button
            className="mr-mr-2 mr-text-grey-light hover:mr-text-red"
            onClick={() => props.unsaveChallenge(props.user.id, challenge.id)}
          >
            <SvgSymbol
              sym="minus-outline-icon"
              viewBox="0 0 32 32"
              className="mr-fill-current mr-w-4 mr-h-4"
            />
          </button>
          <Link to={`/browse/challenges/${challenge.id}`}>
            {challenge.name}
          </Link>
        </li>
      )
    }
  ))

  return challengeItems.length > 0 ?
         <ol className="mr-list-reset">{challengeItems}</ol> :
         <div className="none">No Challenges</div>
}

registerWidgetType(SavedChallengesWidget, descriptor)
