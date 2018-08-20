import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DashboardDataTarget }
       from '../../../../../services/Dashboard/Dashboard'
import { registerBlockType } from '../BlockTypes'
import { searchProjects } from '../../../../../services/Project/Project'
import { extendedFind } from '../../../../../services/Challenge/Challenge'
import WithChallengeResultParents
       from '../../../HOCs/WithChallengeResultParents/WithChallengeResultParents'
import WithSearchResults
       from '../../../../HOCs/WithSearchResults/WithSearchResults'
import WithComboSearch from '../../../HOCs/WithComboSearch/WithComboSearch'
import SearchBox from '../../../../SearchBox/SearchBox'
import SvgControl from '../../../../Bulma/SvgControl'
import ProjectList from '../../ProjectList/ProjectList'
import QuickBlock from '../QuickBlock'
import BlockControl from '../BlockControl'
import './ProjectListBlock.css'

const descriptor = {
  blockKey: 'ProjectListBlock',
  label: "Project List",
  targets: [DashboardDataTarget.projects],
  defaultWidth: 12,
  minWidth: 4,
  defaultHeight: 15,
  minHeight: 11,
  defaultConfiguration: {
    view: 'cards',
    sortBy: ['name'],
  }
}

// Setup child components with needed HOCs.
const ProjectAndChallengeSearch = WithComboSearch(SearchBox, {
  'adminProjects': searchProjects,
  'adminChallenges': queryCriteria =>
    extendedFind({searchQuery: queryCriteria.query, onlyEnabled: false}, 1000),
})

export class ProjectListBlock extends Component {
  setView = view => {
    if (this.props.blockConfiguration.view !== view) {
      this.props.updateBlockConfiguration({view})
    }
  }

  viewControl = (view, icon) => (
    <SvgControl sym={icon ? icon : `${view}-icon`}
                className={{"is-active": this.props.blockConfiguration.view === view}}
                onClick={() => this.setView(view)} />
  )

  render() {
    const viewControls = (
      <div className="project-list-block__view-controls">
        <BlockControl>
          {this.viewControl("card", "cards-icon")}
          {this.viewControl("mixed")}
          {this.viewControl("list")}
        </BlockControl>
      </div>
    )

    const searchControl = this.props.projects.length === 0 ? null : (
      <ProjectAndChallengeSearch className="project-list-block__searchbox"
                                 placeholder="Search" />
    )

    return (
      <QuickBlock {...this.props}
                  className="project-list-block"
                  blockTitle="Projects"
                  titleControls={searchControl}
                  blockControls={viewControls}>
        <ProjectList {...this.props}
                     projects={this.props.resultProjects}
                     expandedView={this.props.blockConfiguration.view === 'card'}
                     mixedView={this.props.blockConfiguration.view === 'mixed'}
                     showPreview={this.props.resultProjects.length < this.props.projects.length} />
      </QuickBlock>
    )
  }
}

ProjectListBlock.propTypes = {
  blockConfiguration: PropTypes.object,
  updateBlockConfiguration: PropTypes.func.isRequired,
  filteredProjects: PropTypes.array,
}

const Block =
  WithSearchResults( // for projects
    WithSearchResults( // for challenges
      WithChallengeResultParents(
        ProjectListBlock,
      ),
      'adminChallenges',
      'challenges',
      'filteredChallenges',
      true
    ),
    'adminProjects',
    'filteredProjects',
    'resultProjects'
  )

registerBlockType(Block, descriptor)
