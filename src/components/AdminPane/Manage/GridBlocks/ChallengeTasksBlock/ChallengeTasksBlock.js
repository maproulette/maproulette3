import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import ViewChallengeTasks from '../../ViewChallengeTasks/ViewChallengeTasks'
import QuickBlock from '../QuickBlock'
import messages from './Messages'

const descriptor = {
  blockKey: 'ChallengeTasksBlock',
  label: messages.label,
  targets: [DashboardDataTarget.challenge],
  minWidth: 4,
  defaultWidth: 8,
  defaultHeight: 49,
}

export class ChallengeTasksBlock extends Component {
  render() {
    return (
      <QuickBlock {...this.props}
                  className="calendar-heatmap-block"
                  blockTitle={<FormattedMessage {...messages.title} />}>
        <ViewChallengeTasks {...this.props} />
      </QuickBlock>
    )
  }
}

registerBlockType(ChallengeTasksBlock, descriptor)
