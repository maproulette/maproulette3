import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
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
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
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
    /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
    <a onClick={() => this.setView(view)}>
      <SvgSymbol
        sym={icon ? icon : `${view}-icon`}
        viewBox="0 0 20 20"
        className={classNames(
          "mr-h-6 mr-w-6 mr-fill-blue-dark mr-ml-4",
          {"mr-fill-green-light": this.props.widgetConfiguration.view === view}
        )}
      />
    </a>
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
      <ProjectAndChallengeSearch className="mr-p-2 mr-text-grey-light mr-border mr-border-grey-light mr-rounded-sm" 
        inputClassName="mr-text-grey mr-leading-normal"
        placeholder={this.props.intl.formatMessage(messages.searchPlaceholder)} />
    )

    return (
      <QuickWidget {...this.props}
                  className="project-list-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}
                  headerControls={searchControl}
                  rightHeaderControls={viewControls}>
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
