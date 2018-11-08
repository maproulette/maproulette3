import React, { Component } from 'react'
import { FormattedMessage, FormattedDate } from 'react-intl'
import _get from 'lodash/get'
import { ChallengeStatus, messagesByStatus }
       from  '../../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import AsManager from '../../../../../interactions/User/AsManager'
import ChallengeKeywords from '../../ChallengeKeywords/ChallengeKeywords'
import VisibilitySwitch from '../../VisibilitySwitch/VisibilitySwitch'
import QuickBlock from '../QuickBlock'
import messages from './Messages'
import './ChallengeOverviewBlock.css'

const descriptor = {
  blockKey: 'ChallengeOverviewBlock',
  label: messages.label,
  targets: [DashboardDataTarget.challenge],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 7,
}

export class ChallengeOverviewBlock extends Component {
  render() {
    const manager = AsManager(this.props.user)
    const status = _get(this.props, 'challenge.status', ChallengeStatus.none)

    return (
      <QuickBlock {...this.props}
                  className="challenge-overview-block"
                  blockTitle={<FormattedMessage {...messages.title} />}>
        <div className="columns">
          <div className="column is-one-third status-label">
            <FormattedMessage {...messages.status} />
          </div>

          <div className="column is-narrow status-value">
            <FormattedMessage {...messagesByStatus[status]} />
          </div>
        </div>

        <div className="columns">
          <div className="column is-one-third status-label">
            <FormattedMessage {...messages.visibleLabel} />
          </div>

          <div className="column is-narrow status-value">
            {this.props.challenge.parent &&
             <VisibilitySwitch {...this.props}
                               disabled={!manager.canWriteProject(this.props.challenge.parent)} />
            }
          </div>
        </div>

        <ChallengeKeywords challenge={this.props.challenge} />

        <div className="columns">
          <div className="column is-one-third status-label">
            <FormattedMessage {...messages.creationDate} />
          </div>

          <div className="column is-narrow status-value">
            {this.props.challenge.created &&
             <FormattedDate value={new Date(this.props.challenge.created)}
                            year='numeric' month='long' day='2-digit' />
            }
          </div>
        </div>

        <div className="columns">
          <div className="column is-one-third status-label">
            <FormattedMessage {...messages.lastModifiedDate} />
          </div>

          <div className="column is-narrow status-value">
            {this.props.challenge.modified &&
             <FormattedDate value={new Date(this.props.challenge.modified)}
                            year='numeric' month='long' day='2-digit' />
            }
          </div>
        </div>

        <div className="columns">
          <div className="column is-one-third status-label">
            <FormattedMessage {...messages.tasksRefreshDate} />
          </div>

          <div className="column is-narrow status-value">
            {this.props.challenge.lastTaskRefresh &&
             <FormattedDate value={new Date(this.props.challenge.lastTaskRefresh)}
                            year='numeric' month='long' day='2-digit' />
            }
          </div>
        </div>
      </QuickBlock>
    )
  }
}

registerBlockType(ChallengeOverviewBlock, descriptor)
