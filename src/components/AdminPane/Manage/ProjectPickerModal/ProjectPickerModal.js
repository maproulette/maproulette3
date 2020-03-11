import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _isEmpty from 'lodash/isEmpty'
import { searchProjects, fetchManageableProjects }
       from '../../../../services/Project/Project'
import WithSearch from '../../../HOCs/WithSearch/WithSearch'
import WithSearchResults
       from '../../../HOCs/WithSearchResults/WithSearchResults'
import WithPagedProjects
       from '../../../HOCs/WithPagedProjects/WithPagedProjects'
import SearchBox from '../../../SearchBox/SearchBox'
import Modal from '../../../Modal/Modal'
import PageResultsButton from '../../../LoadMoreButton/PageResultsButton'
import messages from './Messages'


export class ProjectPickerModal extends Component {
  render() {
    return (
      <Modal
        isActive
        narrow
        onClose={this.props.onCancel}
        contentClassName="mr-h-screen50"
      >
        <div className="mr-text-yellow mr-text-lg mr-mb-2 mr-mr-6">
          <FormattedMessage {...messages.chooseProject} />
        </div>

        <div className="mr-w-64 mr-mb-6">
          <ProjectSearch leftAligned />
        </div>

        <CandidateProjectList
          projects={this.props.pagedCandidateProjects}
          currentProjectId={this.props.currentProjectId}
          onSelectProject={this.props.onSelectProject}
        />

        <div className="mr-mt-4">
          <MoreResults
            hasMoreResults={this.props.hasMoreResults}
            isLoading={this.props.isLoading}
          />
        </div>
      </Modal>
    )
  }
}

const executeSearch = function(queryCriteria) {
  // If no query, fetch all manageable projects
  if (!queryCriteria.query) {
    return fetchManageableProjects(
      _get(queryCriteria, 'page.currentPage'),
      _get(queryCriteria, 'page.resultsPerPage')
    )
  }

  searchProjects({
    searchQuery: queryCriteria.query,
    page: _get(queryCriteria, "page.currentPage"),
    onlyEnabled: false
  }, _get(queryCriteria, "page.resultsPerPage"))
}

const ProjectSearch = WithSearch(
  SearchBox,
  'projectPickerModal',
  executeSearch
)

const MoreResults = WithSearch(
  PageResultsButton,
  'projectPickerModal',
  executeSearch
)

const CandidateProjectList = function(props) {
  const projectItems = _compact(_map(props.projects, project => {
    if (project.id === props.currentProjectId) {
      return null
    }

    return (
      <li key={`project-${project.id}`}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          onClick={() => props.onSelectProject(project)}
        >
          {project.displayName ? project.displayName : project.name}
        </a>
      </li>
    )
  }))

  return _isEmpty(projectItems) ?
    <FormattedMessage {...messages.noProjects} /> : (
    <ol className="mr-list-dropdown">
      {projectItems}
    </ol>
  )
}

export default
  WithSearchResults(
    WithPagedProjects(
      ProjectPickerModal,
      'candidateProjects',
      'pagedCandidateProjects',
      'projectPickerModal'
    ),
    'projectPickerModal',
    'projects',
    'candidateProjects'
  )
