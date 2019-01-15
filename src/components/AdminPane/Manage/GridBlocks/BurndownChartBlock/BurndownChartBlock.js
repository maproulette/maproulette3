import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import BurndownChart from '../../BurndownChart/BurndownChart'
import QuickBlock from '../QuickBlock'
import messages from './Messages'
import './BurndownChartBlock.scss'

const descriptor = {
  blockKey: 'BurndownChartBlock',
  label: messages.label,
  targets: [DashboardDataTarget.challenges, DashboardDataTarget.challenge],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 12,
}

export default class BurndownChartBlock extends Component {
  render() {
    return (
      <QuickBlock {...this.props}
                  className="burndown-chart-block"
                  blockTitle={
                    <FormattedMessage {...messages.title}
                                      values={{taskCount: this.props.tasksAvailable}} />
                  }>
        <BurndownChart {...this.props} suppressHeading />
      </QuickBlock>
    )
  }
}

registerBlockType(BurndownChartBlock, descriptor)
