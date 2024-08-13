import { Component } from 'react'
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
    <a onClick={() => this.setView(view)}>
      <SvgSymbol
        sym={icon ? icon : `${view}-icon`}
        viewBox="0 0 20 20"
        className={classNames(
          "mr-h-4 mr-w-4 mr-ml-4",
          this.props.widgetConfiguration.view === view ? "mr-fill-white" : "mr-fill-white-50"
        )}
      />
    </a>
  )

  render() {
    const viewControls = (
      <div>
        <MenuControl>
          {this.viewControl("card", "cards-icon")}
          {this.viewControl("mixed")}
          {this.viewControl("list")}
        </MenuControl>
      </div>
    )

    const searchControl = this.props.projects.length === 0 ? null : (
      <ProjectAndChallengeSearch
        placeholder={this.props.intl.formatMessage(messages.searchPlaceholder)}
      />
    )

    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
        headerControls={<div className="mr-my-2">{searchControl}</div>}
        rightHeaderControls={<div className="mr-my-2">{viewControls}</div>}
      >
        <ProjectList
          {...this.props}
          projects={this.props.pagedProjects}
          expandedView={this.props.widgetConfiguration.view === 'card'}
          mixedView={this.props.widgetConfiguration.view === 'mixed'}
          showPreview={this.props.adminProjectsSearchActive}
        />
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
    (queryCriteria, resultsPerPage, props) => {
      // We only fetch all managed projects if we are not doing a query.
      if (queryCriteria.query) {
        return null
      }

      const filters = _get(props, 'currentConfiguration.filters.projectFilters', {})
      return fetchManageableProjects(
        _get(queryCriteria, 'page.currentPage'),
        _get(queryCriteria, 'page.resultsPerPage'),
        filters.owner,
        filters.visible
       )
    },
  )

registerWidgetType(Widget, descriptor)
