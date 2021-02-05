import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import CompletionRadar from '../../CompletionRadar/CompletionRadar'
import BusySpinner from '../../../../BusySpinner/BusySpinner'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import WithChallengeMetrics
       from '../../../HOCs/WithChallengeMetrics/WithChallengeMetrics'
import messages from './Messages'
import './StatusRadarWidget.scss'

const descriptor = {
  widgetKey: 'StatusRadarWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenges, WidgetDataTarget.challenge],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 12,
}

export default class StatusRadarWidget extends Component {
  render() {
    let content = null
    if (this.props.singleProject) {
      if (!this.props.project) {
        content = <BusySpinner />
      }
      else if (!this.props.challengeStatsAvailable) {
        content = (
          <button
            type="button"
            className="mr-button"
            onClick={() => this.props.loadChallengeStats(this.props.project)}
          >
            <FormattedMessage {...messages.loadStatsLabel} />
          </button>
        )
      }
      else if (this.props.loadingChallengeStats) {
        content = <BusySpinner />
      }
    }

    if (!content) {
      content = <CompletionRadar {...this.props} className="mr-h-full" suppressHeading />
    }

    return (
      <QuickWidget
        {...this.props}
        className="status-radar-widget"
        noMain
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        {content}
      </QuickWidget>
    )
  }
}

registerWidgetType(WithChallengeMetrics(StatusRadarWidget), descriptor)
