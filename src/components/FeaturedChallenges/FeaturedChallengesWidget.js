import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import _isFinite from 'lodash/isFinite'
import { Link } from 'react-router-dom'
import { WidgetDataTarget, registerWidgetType }
       from '../../services/Widget/Widget'
import WithFeaturedChallenges
       from '../HOCs/WithFeaturedChallenges/WithFeaturedChallenges'
import QuickWidget from '../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'FeaturedChallengesWidget',
  label: messages.header,
  targets: [
    WidgetDataTarget.user,
  ],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 2,
  defaultHeight: 5,
}

export default class FeaturedChallengesWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="featured-challenges-widget"
        widgetTitle={<FormattedMessage {...messages.header} />}
      >
        <FeaturedChallengeList {...this.props} />
      </QuickWidget>
    )
  }
}

const FeaturedChallengeList = function(props) {
  const challengeItems =
    _compact(_map(props.featuredChallenges, challenge => {
      if (!_isFinite(_get(challenge, 'id'))) {
        return null
      }

      return (
        <li key={challenge.id} className="mr-pb-1">
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

registerWidgetType(WithFeaturedChallenges(FeaturedChallengesWidget), descriptor)
