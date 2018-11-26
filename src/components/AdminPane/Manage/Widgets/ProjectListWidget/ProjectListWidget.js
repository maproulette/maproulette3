import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import _get from 'lodash/get'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import { searchProjects, fetchManageableProjects } from '../../../../../services/Project/Project'
import { extendedFind } from '../../../../../services/Challenge/Challenge'
import WithChallengeResultParents
       from '../../../HOCs/WithChallengeResultParents/WithChallengeResultParents'
import WithSearchResults
       from '../../../../HOCs/WithSearchResults/WithSearchResults'
import WithComboSearch from '../../../HOCs/WithComboSearch/WithComboSearch'
import WithSearch from '../../../../HOCs/WithSearch/WithSearch'
import WithPagedProjects from '../../../../HOCs/WithPagedProjects/WithPagedProjects'
import SearchBox from '../../../../SearchBox/SearchBox'
import SvgControl from '../../../../Bulma/SvgControl'
import ProjectList from '../../ProjectList/ProjectList'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import MenuControl from '../../../../QuickWidget/MenuControl'
import messages from './Messages'
import './ProjectListWidget.scss'

const descriptor = {
  widgetKey: 'ProjectListWidget',
  label: messages.label,
  targets: [WidgetDataTarget.projects],
  defaultWidth: 12,
  minWidth: 4,
  defaultHeight: 15,
  minHeight: 11,
  defaultConfiguration: {
    view: 'card',
    sortBy: ['name'],
  }
}

// Setup child components with needed HOCs.
const ProjectAndChallengeSearch = WithComboSearch(SearchBox, {
  'adminProjects': queryCriteria => {
      // If no query is present then we don't need to search
      if (!queryCriteria.query) {
        return null
      }
      return searchProjects({searchQuery: queryCriteria.query,
                             page: _get(queryCriteria, "page.currentPage"),
                             onlyEnabled: false},
                             _get(queryCriteria, "page.resultsPerPage"))
    },
  'adminChallenges': queryCriteria => {
      // If no query is present then we don't need to search
      if (!queryCriteria.query) {
        return null
      }
      return extendedFind({searchQuery: queryCriteria.query,
                           page: _get(queryCriteria, "page.currentPage"),
                           onlyEnabled: false},
                           _get(queryCriteria, "page.resultsPerPage"))
    },
})

export default class ProjectListWidget extends Component {
  setView = view => {
    if (this.props.widgetConfiguration.view !== view) {
      this.props.updateWidgetConfiguration({view})
    }
  }

  viewControl = (view, icon) => (
    <SvgControl sym={icon ? icon : `${view}-icon`}
                className={{"is-active": this.props.widgetConfiguration.view === view}}
                onClick={() => this.setView(view)} />
  )

  render() {
    const viewControls = (
      <div className="project-list-widget__view-controls">
        <MenuControl>
          {this.viewControl("card", "cards-icon")}
          {this.viewControl("mixed")}
          {this.viewControl("list")}
        </MenuControl>
      </div>
    )

    const searchControl = this.props.projects.length === 0 ? null : (
      <ProjectAndChallengeSearch
        inputClassName="mr-text-blue mr-border-b mr-border-blue"
        placeholder={this.props.intl.formatMessage(messages.searchPlaceholder)} />
    )

    return (
      <QuickWidget {...this.props}
                  className="project-list-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}
                  headerControls={searchControl}
                  menuControls={viewControls}>
        <ProjectList {...this.props}
                     projects={this.props.pagedProjects}
                     expandedView={this.props.widgetConfiguration.view === 'card'}
                     mixedView={this.props.widgetConfiguration.view === 'mixed'}
                     showPreview={this.props.adminProjectsSearchActive} />
      </QuickWidget>
    )
  }
}

ProjectListWidget.propTypes = {
  widgetConfiguration: PropTypes.object,
  updateWidgetConfiguration: PropTypes.func.isRequired,
  filteredProjects: PropTypes.array,
}

const Widget =
  WithSearch(
    WithSearchResults( // for projects
      WithSearchResults( // for challenges
        WithChallengeResultParents(
          WithPagedProjects(
            injectIntl(ProjectListWidget), "resultProjects", "pagedProjects")
        ),
        'adminChallenges',
        'challenges',
        'filteredChallenges'
      ),
      'adminProjects',
      'filteredProjects',
      'resultProjects'
    ),
    'adminProjectList',
    queryCriteria => {
      // We only fetch all managed projects if we are not doing a query.
      if (queryCriteria.query) {
        return null
      }
      return fetchManageableProjects(_get(queryCriteria, 'page.currentPage'),
                                     _get(queryCriteria, 'page.resultsPerPage'))
    },
  )

registerWidgetType(Widget, descriptor)
