import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import MarkdownContent from '../../../../MarkdownContent/MarkdownContent'
import QuickBlock from '../QuickBlock'
import messages from './Messages'
import './ProjectAboutBlock.css'

const descriptor = {
  blockKey: 'ProjectAboutBlock',
  label: messages.label,
  targets: [DashboardDataTarget.projects, DashboardDataTarget.project],
  defaultWidth: 6,
  defaultHeight: 7,
}

export class ProjectAboutBlock extends Component {
  render() {
    return (
      <QuickBlock {...this.props}
                  className="project-about-block"
                  blockTitle={<FormattedMessage {...messages.title} />}>
        <MarkdownContent markdown={this.props.intl.formatMessage(messages.content)} />
      </QuickBlock>
    )
  }
}

registerBlockType(injectIntl(ProjectAboutBlock), descriptor)
