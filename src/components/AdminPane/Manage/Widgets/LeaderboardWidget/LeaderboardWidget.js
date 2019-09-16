import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import WithLeaderboard
       from '../../../../../components/HOCs/WithLeaderboard/WithLeaderboard'
import ChallengeOwnerLeaderboard
       from '../../ChallengeOwnerLeaderboard/ChallengeOwnerLeaderboard'
import PastDurationSelector
       from '../../../../PastDurationSelector/PastDurationSelector'
import { CURRENT_MONTH }
       from '../../../../PastDurationSelector/PastDurationSelector'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import messages from './Messages'
import './LeaderboardWidget.scss'

const INITIAL_MONTHS_PAST = 1

const descriptor = {
  widgetKey: 'LeaderboardWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenges, WidgetDataTarget.challenge],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 8,
  defaultConfiguration: {
    monthsPast: 1,
  },
}

export default class LeaderboardWidget extends Component {
  setMonthsPast = monthsPast => {
    this.props.setMonthsPast(monthsPast, true)

    if (this.props.widgetConfiguration.monthsPast !== monthsPast) {
      this.props.updateWidgetConfiguration({monthsPast})
    }
  }

  componentDidMount() {
    this.props.setMonthsPast(this.props.widgetConfiguration.monthsPast, true)
  }

  render() {
    const monthsPast = this.props.widgetConfiguration.monthsPast

    const selector =
      <PastDurationSelector
        className="mr-button mr-button--blue mr-mr-8"
        pastMonthsOptions={[CURRENT_MONTH, 1, 3, 6, 12]}
        currentMonthsPast={monthsPast}
        selectDuration={this.setMonthsPast}
      />

    return (
      <QuickWidget {...this.props}
                  className="leaderboard-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}
                  headerControls={selector}
      >
        <ChallengeOwnerLeaderboard {...this.props} monthsPast={monthsPast} />
      </QuickWidget>
    )
  }
}

registerWidgetType(WithLeaderboard(LeaderboardWidget, INITIAL_MONTHS_PAST,
                                   {ignoreUser: true, filterChallenges: true}), descriptor)
