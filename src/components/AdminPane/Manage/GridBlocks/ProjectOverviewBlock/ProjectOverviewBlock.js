import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import ProjectOverview from '../../ProjectOverview/ProjectOverview'
import MarkdownContent from '../../../../MarkdownContent/MarkdownContent'
import QuickBlock from '../QuickBlock'
import messages from './Messages'
import './ProjectOverviewBlock.scss'

const descriptor = {
  blockKey: 'ProjectOverviewBlock',
  label: messages.label,
  targets: [DashboardDataTarget.project],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 7,
}

export default class ProjectOverviewBlock extends Component {
  render() {
    return (
      <QuickBlock {...this.props}
                  className="project-overview-block"
                  blockTitle={<FormattedMessage {...messages.title} />}>
        <ProjectOverview {...this.props} suppressDescription />

        <div className="project-overview-block__project-description">
          <MarkdownContent markdown={this.props.project.description} />
        </div>
      </QuickBlock>
    )
  }
}

registerBlockType(ProjectOverviewBlock, descriptor)
