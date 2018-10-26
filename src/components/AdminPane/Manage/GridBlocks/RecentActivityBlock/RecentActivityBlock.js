import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _takeRight from 'lodash/takeRight'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import ChallengeActivityTimeline
       from '../../../../ActivityTimeline/ChallengeActivityTimeline/ChallengeActivityTimeline'
import QuickBlock from '../QuickBlock'
import messages from './Messages'

const descriptor = {
  blockKey: 'RecentActivityBlock',
  label: messages.label,
  targets: [DashboardDataTarget.challenge],
  defaultWidth: 4,
  defaultHeight: 14,
}

export class RecentActivityBlock extends Component {
  render() {
    return (
      <QuickBlock {...this.props}
                  className="recent-activity-block"
                  blockTitle={<FormattedMessage {...messages.title} />}>
        <ChallengeActivityTimeline activity={
          _takeRight(_get(this.props, 'challenge.activity', []), 90)
        } maxEntries={14} invertBadges={false} />
      </QuickBlock>
    )
  }
}

registerBlockType(RecentActivityBlock, descriptor)
