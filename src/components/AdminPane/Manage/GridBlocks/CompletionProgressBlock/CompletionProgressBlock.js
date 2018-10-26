import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import ChallengeProgress from '../../../../ChallengeProgress/ChallengeProgress'
import QuickBlock from '../QuickBlock'
import messages from './Messages'

const descriptor = {
  blockKey: 'CompletionProgressBlock',
  label: messages.label,
  targets: [DashboardDataTarget.challenges, DashboardDataTarget.challenge],
  defaultWidth: 4,
  defaultHeight: 5,
}

export class CompletionProgressBlock extends Component {
  render() {
    return (
      <QuickBlock {...this.props}
                  className="completion-progress-block"
                  blockTitle={<FormattedMessage {...messages.title} />}>
         <ChallengeProgress {...this.props} />
      </QuickBlock>
    )
  }
}

registerBlockType(CompletionProgressBlock, descriptor)
