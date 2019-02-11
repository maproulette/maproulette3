import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import ChallengeShareControls
       from '../../TaskPane/ChallengeShareControls/ChallengeShareControls'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ChallengeShareWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenge, WidgetDataTarget.task],
  minWidth: 2,
  defaultWidth: 3,
  minHeight: 3,
  defaultHeight: 3,
}

export default class ChallengeShareWidget extends Component {
  render() {
    const challenge = this.props.task ?
                      this.props.task.parent :
                      this.props.challenge

    return (
      <QuickWidget {...this.props}
                  className="task-instructions-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}>
        <ChallengeShareControls className="active-task-details__share-controls"
                                challenge={challenge} />
      </QuickWidget>
    )
  }
}

registerWidgetType(ChallengeShareWidget, descriptor)
