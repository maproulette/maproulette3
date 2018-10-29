import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import CompletionRadar from '../../CompletionRadar/CompletionRadar'
import QuickBlock from '../QuickBlock'
import messages from './Messages'
import './StatusRadarBlock.css'

const descriptor = {
  blockKey: 'StatusRadarBlock',
  label: messages.label,
  targets: [DashboardDataTarget.challenges, DashboardDataTarget.challenge],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 12,
}

export class StatusRadarBlock extends Component {
  render() {
    return (
      <QuickBlock {...this.props}
                  className="status-radar-block"
                  blockTitle={<FormattedMessage {...messages.title} />}>
        <CompletionRadar {...this.props} suppressHeading />
      </QuickBlock>
    )
  }
}

registerBlockType(StatusRadarBlock, descriptor)
