import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import messages from '../Messages'
import QuickWidget from '../../../components/QuickWidget/QuickWidget'
import ChallengeProgress from '../../../components/ChallengeProgress/ChallengeProgress'
import PastDurationSelector from '../../../components/PastDurationSelector/PastDurationSelector'
import {ALL_TIME, CURRENT_MONTH, CUSTOM_RANGE}
       from '../../../components/PastDurationSelector/PastDurationSelector'

export default class TaskStats extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="mr-card-widget mr-card-widget--padded mr-mb-4 md:mr-col-span-2"
        widgetTitle={
          <FormattedMessage {...messages.completedTasksTitle} />
        }
        rightHeaderControls={
          <PastDurationSelector
            className="mr-button mr-button--small"
            pastMonthsOptions={[1, 3, 6, 9, 12, CURRENT_MONTH, ALL_TIME, CUSTOM_RANGE]}
            currentMonthsPast={this.props.tasksCompletedMonthsPast}
            selectDuration={this.props.setTasksCompletedMonthsPast}
            selectCustomRange={this.props.setTasksCompletedDateRange}
          />
        }
        noMain
        permanent
      >
        {this.props.taskMetrics &&
         <ChallengeProgress
           className="mr-mt-4 mr-mb-12"
           listClassName="mr-mt-3"
           taskMetrics={this.props.taskMetrics}
           prominentCounts
           noteAvgExcludesSkip
         />
        }
      </QuickWidget>
    )
  }
}
