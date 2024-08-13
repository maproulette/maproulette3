import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import TagMetrics from '../../../../TagMetrics/TagMetrics'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import WithChallengeTagMetrics
      from '../../../HOCs/WithChallengeTagMetrics/WithChallengeTagMetrics'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TagMetricsWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenge],
  minWidth: 2,
  defaultWidth: 4,
  minHeight: 4,
  defaultHeight: 6
}

export default class TagMetricsWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={
          <FormattedMessage {...messages.title} />
        }
        noMain
      >
        <TagMetrics {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(WithChallengeTagMetrics(TagMetricsWidget), descriptor)
