import { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import MarkdownContent from '../../../../MarkdownContent/MarkdownContent'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ProjectAboutWidget',
  label: messages.label,
  targets: [WidgetDataTarget.projects, WidgetDataTarget.project],
  minWidth: 3,
  defaultWidth: 6,
  defaultHeight: 7,
}

export default class ProjectAboutWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <MarkdownContent markdown={this.props.intl.formatMessage(messages.content)} />
      </QuickWidget>
    )
  }
}

registerWidgetType(injectIntl(ProjectAboutWidget), descriptor)
