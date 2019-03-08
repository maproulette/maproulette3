import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import _isFinite from 'lodash/isFinite'
import { Link } from 'react-router-dom'
import subMonths from 'date-fns/sub_months'
import { WidgetDataTarget, registerWidgetType }
       from '../../services/Widget/Widget'
import QuickWidget from '../QuickWidget/QuickWidget'
import PastDurationSelector
       from '../PastDurationSelector/PastDurationSelector'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TopUserChallengesWidget',
  label: messages.widgetLabel,
  targets: [
    WidgetDataTarget.user,
  ],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 2,
  defaultHeight: 5,
}

export default class TopUserChallengesWidget extends Component {
  setMonthsPast = monthsPast => {
    if (this.props.widgetConfiguration.monthsPast !== monthsPast) {
      this.props.updateWidgetConfiguration({monthsPast})
      this.props.fetchTopChallenges(this.props.user.id,
                                    subMonths(new Date(), monthsPast))
    }
  }

  render() {
    const monthsPast = this.props.widgetConfiguration.monthsPast || 1

    return (
      <QuickWidget
        {...this.props}
        className="top-user-challenges-widget"
        widgetTitle={<FormattedMessage {...messages.header} />}
        rightHeaderControls={
          <PastDurationSelector
            className="mr-button mr-button--small mr-button--green"
            pastMonthsOptions={[1, 3, 6, 12]}
            currentMonthsPast={monthsPast}
            selectDuration={this.setMonthsPast}
          />
        }
      >
        <TopChallengeList {...this.props} />
      </QuickWidget>
    )
  }
}

const TopChallengeList = function(props) {
  const challengeItems =
    _compact(_map(_get(props, 'user.topChallenges', []), challenge => {
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

registerWidgetType(TopUserChallengesWidget, descriptor)
