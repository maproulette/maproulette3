import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import ViewChallengeTasks from '../../ViewChallengeTasks/ViewChallengeTasks'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import {DEFAULT_TIMEZONE_OFFSET} from '../../../../TimezonePicker/TimezonePicker'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ChallengeTasksWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenge],
  minWidth: 6,
  defaultWidth: 8,
  defaultHeight: 49,
  defaultConfiguration: {
    timezoneOffset: DEFAULT_TIMEZONE_OFFSET,
  }
}

export default class ChallengeTasksWidget extends Component {
  setTimezone = timezoneOffset => {
    if (this.props.widgetConfiguration.timezoneOffset !== timezoneOffset) {
      this.props.updateWidgetConfiguration({timezoneOffset})
    }
  }

  render() {
    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <ViewChallengeTasks
          {...this.props}
          changeTimezone={this.setTimezone}
          currentTimezone={this.props.widgetConfiguration.timezoneOffset} />
      </QuickWidget>
    )
  }
}

registerWidgetType(ChallengeTasksWidget, descriptor)
