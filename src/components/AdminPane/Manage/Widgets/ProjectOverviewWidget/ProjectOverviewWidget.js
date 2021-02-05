import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import ProjectOverview from '../../ProjectOverview/ProjectOverview'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ProjectOverviewWidget',
  label: messages.label,
  targets: [WidgetDataTarget.project],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 7,
}

export default class ProjectOverviewWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <ProjectOverview {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(ProjectOverviewWidget, descriptor)
