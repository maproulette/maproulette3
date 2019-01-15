import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import QuickBlock from '../QuickBlock'
import messages from './Messages'

const descriptor = {
  blockKey: 'ProjectCountBlock',
  label: messages.label,
  targets: [DashboardDataTarget.projects],
  minWidth: 2,
  defaultWidth: 6,
  defaultHeight: 4,
}

export default class ProjectCountBlock extends Component {
  render() {
    return (
      <QuickBlock {...this.props}
                  className="project-count-grid-block"
                  blockTitle={<FormattedMessage {...messages.title} />}>
        <h1>{this.props.filteredProjects.length}</h1>
      </QuickBlock>
    )
  }
}

ProjectCountBlock.propTypes = {
  blockProjectFilters: PropTypes.object,
  updateBlockConfiguration: PropTypes.func.isRequired,
  filteredProjects: PropTypes.array,
}

registerBlockType(ProjectCountBlock, descriptor)
