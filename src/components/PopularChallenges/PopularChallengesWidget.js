import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _isFinite from 'lodash/isFinite'
import _take from 'lodash/take'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import _isPlainObject from 'lodash/isPlainObject'
import { Link } from 'react-router-dom'
import { WidgetDataTarget, registerWidgetType }
       from '../../services/Widget/Widget'
import WithChallenges from '../HOCs/WithChallenges/WithChallenges'
import QuickWidget from '../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'PopularChallengesWidget',
  label: messages.header,
  targets: [
    WidgetDataTarget.user,
  ],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 2,
  defaultHeight: 5,
}

export default class PopularChallengesWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="mr-bg-skyline mr-bg-no-repeat"
        widgetTitle={<FormattedMessage {...messages.header} />}
      >
        <PopularChallengeList {...this.props} />
      </QuickWidget>
    )
  }
}

const PopularChallengeList = function(props) {
  const popularChallenges = _take(_reverse(
    _sortBy(props.challenges, challenge =>
      _isFinite(challenge.popularity) ? challenge.popularity : 0
    )), 5)

  const challengeItems = _map(popularChallenges, challenge => (
    <li key={challenge.id} className="mr-py-2">
      <Link to={`/browse/challenges/${challenge.id}`}>
        {challenge.name}
      </Link>
      {_isPlainObject(challenge.parent) && // virtual challenges don't have projects
        <div className="mr-links-grey-light">
          <Link
            onClick={e => {e.stopPropagation()}}
            to={`/browse/projects/${challenge.parent.id}`}
          >
            {challenge.parent.displayName || challenge.parent.name}
          </Link>
        </div>
      }
    </li>
  ))

  return (
    challengeItems.length > 0 ?
    <ol className="mr-list-reset mr-links-green-lighter">
      {challengeItems}
    </ol> :
    <div className="mr-text-grey-lighter">
      <FormattedMessage {...messages.noChallenges} />
    </div>
  )
}

registerWidgetType(WithChallenges(PopularChallengesWidget), descriptor)
