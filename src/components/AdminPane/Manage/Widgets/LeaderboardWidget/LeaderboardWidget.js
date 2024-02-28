import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _noop from 'lodash/noop'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import WithLeaderboard
       from '../../../../../components/HOCs/WithLeaderboard/WithLeaderboard'
import ChallengeOwnerLeaderboard
       from '../../ChallengeOwnerLeaderboard/ChallengeOwnerLeaderboard'
import PastDurationSelector
       from '../../../../PastDurationSelector/PastDurationSelector'
// CURRENT_MONTH removed untill endpoint can handle unique params
import { CUSTOM_RANGE } 
       from '../../../../PastDurationSelector/PastDurationSelector'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import { USER_TYPE_MAPPER, USER_TYPE_REVIEWER }
       from '../../../../../services/Leaderboard/Leaderboard'
import messages from './Messages'

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
  setUserType = userType => {
    if (this.props.widgetConfiguration.userType !== userType) {
      this.props.setUserType(userType,
        this.props.widgetConfiguration.monthsPast,
        this.props.widgetConfiguration.startDate,
        this.props.widgetConfiguration.endDate)

      this.props.updateWidgetConfiguration({userType})
    }
  }

  setMonthsPast = monthsPast => {
    this.props.setMonthsPast(monthsPast, true, this.props.widgetConfiguration.userType)

    if (this.props.widgetConfiguration.monthsPast !== monthsPast) {
      this.props.updateWidgetConfiguration({monthsPast, startDate: null, endDate: null})
    }
  }

  setDateRange = (startDate, endDate) => {
    this.props.setDateRange(startDate, endDate, this.props.widgetConfiguration.userType)

    if (this.props.widgetConfiguration.startDate !== startDate ||
        this.props.widgetConfiguration.endDate !== endDate) {
      this.props.updateWidgetConfiguration({monthsPast: CUSTOM_RANGE,
                                            startDate, endDate})
    }
  }

  componentDidMount() {
    if (this.props.widgetConfiguration.monthsPast !== CUSTOM_RANGE) {
      this.props.setMonthsPast(this.props.widgetConfiguration.monthsPast,
                               true,
                               this.props.widgetConfiguration.userType)
    }
    else if (this.props.widgetConfiguration.startDate &&
             this.props.widgetConfiguration.endDate) {
      this.props.setDateRange(this.props.widgetConfiguration.startDate,
                              this.props.widgetConfiguration.endDate,
                              true,
                              this.props.widgetConfiguration.userType)
    }
  }

  render() {
    const monthsPast = this.props.widgetConfiguration.monthsPast
    const startDate = this.props.widgetConfiguration.startDate
    const endDate = this.props.widgetConfiguration.endDate
    const userType = this.props.widgetConfiguration.userType || USER_TYPE_MAPPER

    const selector =
      <PastDurationSelector
        className="mr-button mr-button--green-lighter mr-button--small mr-dropdown--right"
        // CURRENT_MONTH, and CUSTOM_RANGE removed untill endpoint can handle unique params
        pastMonthsOptions={[1, 3, 6, 12]}
        currentMonthsPast={monthsPast}
        selectDuration={this.setMonthsPast}
        selectCustomRange={this.setDateRange}
        customStartDate={startDate ? new Date(startDate) : null}
        customEndDate={endDate ? new Date(endDate) : null}
      />

    const chooseUserType =
      <div className="mr-text-xs mr--mb-5">
        <span>
          <input
            type="radio"
            name="showByMappers"
            className="mr-radio mr-mr-1"
            checked={userType === USER_TYPE_MAPPER}
            onClick={() => this.setUserType(USER_TYPE_MAPPER)}
            onChange={_noop}
          />
          <label className="mr-ml-1 mr-mr-4">
            <FormattedMessage {...messages[USER_TYPE_MAPPER]}/>
          </label>
        </span>
        <span>
          <input
            type="radio"
            name="showByReviewers"
            className="mr-radio mr-mr-1"
            checked={userType === USER_TYPE_REVIEWER}
            onClick={() => this.setUserType(USER_TYPE_REVIEWER)}
            onChange={_noop}
          />
          <label className="mr-ml-1 mr-mr-4">
            <FormattedMessage {...messages[USER_TYPE_REVIEWER]}/>
          </label>
        </span>
      </div>

    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
        rightHeaderControls={<div className="mr-my-2 mr-flex mr-justify-start">{selector}</div>}
      >
        {chooseUserType}
        <ChallengeOwnerLeaderboard {...this.props} userType={userType} />
      </QuickWidget>
    )
  }
}

registerWidgetType(WithLeaderboard(LeaderboardWidget, INITIAL_MONTHS_PAST,
                                   {ignoreUser: true, filterChallenges: true,
                                    isWidget: true}), descriptor)
