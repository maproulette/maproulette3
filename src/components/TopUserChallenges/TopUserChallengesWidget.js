import React, { Component } from 'react'
import classNames from 'classnames'
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

export class TopUserChallengesWidget extends Component {
  updateChallenges = monthsPast => {
    this.props.fetchTopChallenges(
      this.props.user.id,
      subMonths(new Date(), monthsPast)
    )
  }

  currentMonthsPast = () => {
    return this.props.widgetConfiguration.monthsPast || 1
  }

  setMonthsPast = monthsPast => {
    if (this.props.widgetConfiguration.monthsPast !== monthsPast) {
      this.props.updateWidgetConfiguration({monthsPast})
      this.updateChallenges(monthsPast)
    }
  }

  componentDidMount() {
    if (this.props.user) {
      this.updateChallenges(this.currentMonthsPast())
    }
  }

  render() {
    return (
      <QuickWidget
        {...this.props}
        className="top-user-challenges-widget"
        widgetTitle={<FormattedMessage {...messages.header} />}
        rightHeaderControls={
          <PastDurationSelector
            className={classNames(
              "mr-button mr-button--small",
              this.props.lightMode ? "mr-button--green" : "mr-button--green-lighter"
            )}
            pastMonthsOptions={[1, 3, 6, 12]}
            currentMonthsPast={this.currentMonthsPast()}
            selectDuration={this.setMonthsPast}
          />
        }
      >
        <TopChallengeList {...this.props} />
      </QuickWidget>
    )
  }
}

TopUserChallengesWidget.defaultProps = {
  lightMode: false,
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

registerWidgetType(TopUserChallengesWidget, descriptor)

export default TopUserChallengesWidget
