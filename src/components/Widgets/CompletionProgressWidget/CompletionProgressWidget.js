import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import ChallengeProgress from '../../ChallengeProgress/ChallengeProgress'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'
import WithChallengeMetrics
       from '../../AdminPane/HOCs/WithChallengeMetrics/WithChallengeMetrics'

const descriptor = {
  widgetKey: 'CompletionProgressWidget',
  label: messages.label,
  targets: [
    WidgetDataTarget.challenges,
    WidgetDataTarget.challenge,
    WidgetDataTarget.task
  ],
  minWidth: 3,
  defaultWidth: 5,
  minHeight: 2,
  defaultHeight: 7,
  defaultConfiguration: {
    showByPriority: false,
  },
}

const ChallengeProgressWithMetrics = WithChallengeMetrics(ChallengeProgress, true)

export default class CompletionProgressWidget extends Component {
  setShowByPriority = showByPriority => {
    this.props.updateWidgetConfiguration({showByPriority: !!showByPriority})
  }

  render() {
    const challenge = this.props.task ?
                      this.props.task.parent :
                      this.props.challenge
    return (
      <QuickWidget
        {...this.props}
        className="completion-progress-widget"
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <ChallengeProgressWithMetrics
          {...this.props}
          className=""
          challenge={challenge}
          showByPriority={this.props.widgetConfiguration.showByPriority}
          setShowByPriority={this.setShowByPriority}
        />
      </QuickWidget>
    )
  }
}

registerWidgetType(CompletionProgressWidget, descriptor)
