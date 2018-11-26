import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import ProjectOverview from '../../ProjectOverview/ProjectOverview'
import MarkdownContent from '../../../../MarkdownContent/MarkdownContent'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import messages from './Messages'
import './ProjectOverviewWidget.scss'

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
      <QuickWidget {...this.props}
                  className="project-overview-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}>
        <ProjectOverview {...this.props} suppressDescription />

        <div className="mr-text-blue-dark mr-mt-4">
          <MarkdownContent markdown={this.props.project.description} />
        </div>
      </QuickWidget>
    )
  }
}

registerWidgetType(ProjectOverviewWidget, descriptor)
