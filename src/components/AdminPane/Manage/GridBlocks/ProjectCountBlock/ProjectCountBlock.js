import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import QuickBlock from '../QuickBlock'

const descriptor = {
  blockKey: 'ProjectCountBlock',
  label: "Project Count",
  targets: [DashboardDataTarget.projects],
  defaultWidth: 6,
  defaultHeight: 4,
}

export class ProjectCountBlock extends Component {
  render() {
    return (
      <QuickBlock {...this.props}
                  className="project-count-grid-block"
                  blockTitle="Project Count">
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
