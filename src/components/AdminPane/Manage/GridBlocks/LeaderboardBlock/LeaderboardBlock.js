import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import ChallengeLeaderboard
       from '../../ChallengeLeaderboard/ChallengeLeaderboard'
import PastDurationSelector
       from '../../../../PastDurationSelector/PastDurationSelector'
import QuickBlock from '../QuickBlock'
import messages from './Messages'
import './LeaderboardBlock.css'

const descriptor = {
  blockKey: 'LeaderboardBlock',
  label: messages.label,
  targets: [DashboardDataTarget.challenges, DashboardDataTarget.challenge],
  defaultWidth: 4,
  defaultHeight: 8,
  defaultConfiguration: {
    monthsPast: 1,
  },
}

export class LeaderboardBlock extends Component {
  setMonthsPast = monthsPast => {
    if (this.props.blockConfiguration.monthsPast !== monthsPast) {
      this.props.updateBlockConfiguration({monthsPast})
    }
  }

  render() {
    const monthsPast = this.props.blockConfiguration.monthsPast || 1

    const selector =
      <PastDurationSelector pastMonthsOptions={[1, 3, 6, 12]}
                            currentMonthsPast={monthsPast}
                            selectDuration={this.setMonthsPast} />

    return (
      <QuickBlock {...this.props}
                  className="leaderboard-block"
                  blockTitle={<FormattedMessage {...messages.title} />}
                  headerControls={selector}>
        <ChallengeLeaderboard suppressHeader
                              monthsPast={monthsPast}
                              {...this.props} />
      </QuickBlock>
    )
  }
}

registerBlockType(LeaderboardBlock, descriptor)
