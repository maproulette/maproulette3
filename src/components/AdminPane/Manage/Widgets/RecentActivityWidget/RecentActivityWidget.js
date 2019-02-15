import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _takeRight from 'lodash/takeRight'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import ChallengeActivityTimeline
       from '../../../../ActivityTimeline/ChallengeActivityTimeline/ChallengeActivityTimeline'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'RecentActivityWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenge],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 14,
}

export default class RecentActivityWidget extends Component {
  render() {
    return (
      <QuickWidget {...this.props}
                  className="recent-activity-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}>
        <ChallengeActivityTimeline activity={
          _takeRight(_get(this.props, 'challenge.activity', []), 90)
        } maxEntries={14} invertBadges={false} />
      </QuickWidget>
    )
  }
}

registerWidgetType(RecentActivityWidget, descriptor)
