import React, { Component } from 'react'
import classNames from 'classnames'
import { FormattedMessage }
       from 'react-intl'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _map from 'lodash/map'
import _isFinite from 'lodash/isFinite'
import _debounce from 'lodash/debounce'
import _cloneDeep from 'lodash/cloneDeep'
import _keys from 'lodash/keys'
import _omit from 'lodash/omit'
import _pull from 'lodash/pull'
import _isEqual from 'lodash/isEqual'
import _isObject from 'lodash/isObject'
import _pick from 'lodash/pick'
import { ReviewTasksType, buildLinkToReviewTableExportCSV, buildLinkToMapperExportCSV } from '../../../services/Task/TaskReview/TaskReview'
import { intlTableProps } from '../../../components/IntlTable/IntlTable'
import IntlTablePagination from '../../../components/IntlTable/IntlTablePagination'
import TaskCommentsModal
       from '../../../components/TaskCommentsModal/TaskCommentsModal'
import ConfigureColumnsModal
       from '../../../components/ConfigureColumnsModal/ConfigureColumnsModal'
import { FILTER_SEARCH_ALL, FILTER_SEARCH_TEXT } from './FilterSuggestTextBox'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'
import Dropdown from '../../../components/Dropdown/Dropdown'
import WithConfigurableColumns from '../../../components/HOCs/WithConfigurableColumns/WithConfigurableColumns'
import WithCurrentUser from '../../../components/HOCs/WithCurrentUser/WithCurrentUser'
import messages from './Messages'
import WithSavedFilters from '../../../components/HOCs/WithSavedFilters/WithSavedFilters'
import SavedFiltersList from '../../../components/SavedFilters/SavedFiltersList'
import ManageSavedFilters from '../../../components/SavedFilters/ManageSavedFilters'
import SharedFiltersModal from '../../../components/SavedFilters/SharedFiltersModal/SharedFiltersModal'
import MapPane from '../../../components/EnhancedMap/MapPane/MapPane'
import { setupColumnTypes } from './TasksReviewTableDefaultColumnTypes'
import ReactTable from 'react-table-6'

export const getFilterIds = (search, param) => {
  const searchParams = new URLSearchParams(search);
  for (let pair of searchParams.entries()) {
    if (pair[0] === param && pair[1]) {
      if (pair[1] === '0') {
        return [FILTER_SEARCH_ALL]
      }
      return pair[1].split(',').map(n => Number(n))
    }
  }

  return [FILTER_SEARCH_ALL];
}

/**
 * TaskReviewTable displays tasks that need to be reviewed or have been reviewed
 * as a table.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class TaskReviewTable extends Component {
  componentIsMounted = false

  state = {
    displayMap: localStorage.getItem('displayMap') === 'true' ? true : false,    
    openComments: null,
    showConfigureColumns: false,
    challengeFilterIds: getFilterIds(this.props.location.search, 'filters.challengeId'),
    projectFilterIds: getFilterIds(this.props.location.search, 'filters.projectId')
  }

  debouncedUpdateTasks = _debounce(this.updateTasks, 100)

  updateTasks(tableState) {
    const sortCriteria = {
      sortBy: tableState.sorted[0].id,
      direction: tableState.sorted[0].desc ? "DESC" : "ASC",
    }

    const filters = {}
    _each(tableState.filtered, (pair) => {filters[pair.id] = pair.value})

    // Determine if we can search by challenge Id or do name search
    if (filters.challenge) {
      if (_isObject(filters.challenge)) {
        if (!this.state.challengeFilterIds.includes(FILTER_SEARCH_TEXT) && !this.state.challengeFilterIds.includes(FILTER_SEARCH_ALL)) {
          filters.challengeId = this.state.challengeFilterIds
          filters.challenge = null
        } else if (filters.challenge.id === FILTER_SEARCH_ALL) {
          // Search all
          filters.challengeId = null
          filters.challenge = null
          filters.challengeName = null
        }
      }
    }

    // Determine if we can search by project Id or do name search
    if (filters.project) {
      if (_isObject(filters.project)) {
        if (!this.state.projectFilterIds.includes(FILTER_SEARCH_TEXT) && !this.state.projectFilterIds.includes(FILTER_SEARCH_ALL)) {
          filters.projectId = this.state.projectFilterIds
          filters.project = null
        } else if (filters.project.id === FILTER_SEARCH_ALL) {
          // Search all
          filters.projectId = null
          filters.project = null
          filters.projectName = null
        }
      }
    }
    
    if (this.componentIsMounted) {
      this.setState({lastTableState: _pick(tableState, ["sorted", "filtered", "page"])})
      this.props.updateReviewTasks({sortCriteria, filters, page: tableState.page,
        boundingBox: this.props.reviewCriteria.boundingBox,
        includeTags: !!_get(this.props.addedColumns, 'tags')})
    }
  }

  startReviewing() {
    this.props.startReviewing(this.props.history)
  }

  startMetaReviewing() {
    this.props.startReviewing(this.props.history, true)
  }

  toggleShowFavorites() {
    const reviewCriteria = _cloneDeep(this.props.reviewCriteria)
    reviewCriteria.savedChallengesOnly = !reviewCriteria.savedChallengesOnly
    this.props.updateReviewTasks(reviewCriteria)
  }

  toggleExcludeOthers() {
    const reviewCriteria = _cloneDeep(this.props.reviewCriteria)
    reviewCriteria.excludeOtherReviewers = !reviewCriteria.excludeOtherReviewers
    this.props.updateReviewTasks(reviewCriteria)
  }

  updateChallengeFilterIds = (item) => {
    let newIds = []
    if (item.id > 0) {
      newIds = this.state.challengeFilterIds.filter(i => i > 0);
      if (this.state.challengeFilterIds.includes(item.id)) {
        newIds = newIds.filter(i => i !== item.id);
      } else {
        newIds.push(item.id)
      }
    } else {
      newIds = [item.id]
    }

    this.setState({ challengeFilterIds: newIds })
  }

  updateProjectFilterIds = (item) => {
    let newIds = []
    if (item.id > 0) {
      newIds = this.state.projectFilterIds.filter(i => i > 0);
      if (this.state.projectFilterIds.includes(item.id)) {
        newIds = newIds.filter(i => i !== item.id);
      } else {
        newIds.push(item.id)
      }
    } else {
      newIds = [item.id]
    }

    this.setState({ projectFilterIds: newIds })
  }

  componentWillUnmount() {
    this.componentIsMounted = false
  }

  componentDidMount() {
    this.componentIsMounted = true
    this.setupConfigurableColumns(this.props.reviewTasksType)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.reviewTasksType !== this.props.reviewTasksType) {
      this.setupConfigurableColumns(this.props.reviewTasksType)
    }

    if (
      !_isEqual(getFilterIds(this.props.location.search, 'filters.challengeId'), this.state.challengeFilterIds) ||
      !_isEqual(getFilterIds(this.props.location.search, 'filters.projectId'), this.state.projectFilterIds)
    ) {
      setTimeout(() => this.setState({ 
        challengeFilterIds: getFilterIds(this.props.location.search, 'filters.challengeId'),
        projectFilterIds: getFilterIds(this.props.location.search, 'filters.projectId')
      }), 100)
    }

    // If we've added the "tag" column, we need to update the table to fetch
    // the tag data.
    else if (!_get(prevProps.addedColumns, 'tags') &&
        _get(this.props.addedColumns, 'tags') &&
        this.state.lastTableState) {
      this.updateTasks(this.state.lastTableState)
    }
  }

  setupConfigurableColumns = (reviewTasksType) => {
    let columns = {"id":{},
                   "featureId":{},
                   "reviewStatus":{permanent: true},
                   "reviewRequestedBy":{},
                   "challengeId":{},
                   "challenge":{},
                   "projectId":{},
                   "project":{},
                   "mappedOn":{},
                   "reviewedBy":{},
                   "reviewedAt":{},
                   "status":{},
                   "priority":{},
                   "reviewCompleteControls":{permanent: true},
                   "reviewerControls":{permanent: true},
                   "mapperControls":{permanent: true},
                   "viewComments":{},
                   "tags":{},
                   "additionalReviewers":{}}

    if (this.props.metaReviewEnabled) {
      columns.metaReviewStatus = {}
      columns.metaReviewedBy = {}
      columns.metaReviewedAt = {}
      columns.metaReviewerControls = {permanent: true}
    }
    let defaultColumns = _keys(columns)

    // Remove any columns not relevant to the current tab.
    switch(reviewTasksType) {
      case ReviewTasksType.reviewedByMe:
        columns = _omit(columns,  ["reviewerControls", "mapperControls", "metaReviewerControls"])
        defaultColumns = _pull(defaultColumns, ...["reviewedBy", "reviewerControls", "mapperControls", "metaReviewerControls"])

        break
      case ReviewTasksType.toBeReviewed:
        columns = _omit(columns,  ["reviewCompleteControls", "mapperControls", "metaReviewerControls"])
        defaultColumns = _pull(defaultColumns, ...["reviewCompleteControls", "mapperControls", "metaReviewerControls"])

        break
      case ReviewTasksType.allReviewedTasks:
        columns = _omit(columns,  ["reviewCompleteControls", "reviewerControls", "metaReviewerControls"])
        defaultColumns = _pull(defaultColumns, ...["reviewCompleteControls", "reviewerControls", "metaReviewerControls"])

        break
      case ReviewTasksType.metaReviewTasks:
        columns = _omit(columns,  ["reviewCompleteControls", "reviewerControls", "mapperControls"])
        defaultColumns = _pull(defaultColumns, ...["reviewCompleteControls", "reviewerControls", "mapperControls"])

        break
      case ReviewTasksType.myReviewedTasks:
      default:
        columns = _omit(columns,  ["reviewRequestedBy", "reviewCompleteControls", "reviewerControls", "metaReviewerControls"])
        defaultColumns = _pull(defaultColumns, ...["reviewRequestedBy", "reviewCompleteControls", "reviewerControls", "metaReviewerControls"])

        break
    }

    this.props.resetColumnChoices(columns, defaultColumns)
  }

  filterDropdown = () => {
    return (
      <Dropdown className="mr-dropdown--right"
          dropdownButton={dropdown => (
            <button onClick={dropdown.toggleDropdownVisible}
              className="mr-text-green-lighter hover:mr-text-white mr-transition-colors">
            <SvgSymbol
              sym="filter-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-5 mr-h-5" />
            </button>
          )}
          dropdownContent={(dropdown) =>
            <ul className="mr-list-dropdown mr-text-green-lighter mr-links-green-lighter">
              <SavedFiltersList
                searchFilters={this.props.reviewCriteria}
                afterClick={dropdown.toggleDropdownVisible}
                {...this.props}
              />
            </ul>
          }
      />
    )
  }

  gearDropdown = (reviewTasksType) => {
    return (
      <Dropdown className="mr-dropdown--right"
        dropdownButton={dropdown => (
          <button onClick={dropdown.toggleDropdownVisible}
            className="mr-text-green-lighter hover:mr-text-white mr-transition-colors">
            <SvgSymbol sym="cog-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-5 mr-h-5" />
          </button>
        )}
        dropdownContent={(dropdown) =>
          <ul className="mr-list-dropdown mr-text-green-lighter mr-links-green-lighter">
            <li>
              <button
                className="mr-text-green-lighter hover:mr-text-white mr-transition-colors"
                onClick={() => {
                  this.setState({showConfigureColumns: true}) 
                  dropdown.toggleDropdownVisible()}}
              >
                <FormattedMessage {...messages.configureColumnsLabel} />
              </button>
            </li>
            {(reviewTasksType === ReviewTasksType.allReviewedTasks || reviewTasksType === ReviewTasksType.toBeReviewed) &&
              <li>
                {this.props.reviewCriteria.filters.project ?
                  <a target="_blank"
                    rel="noopener noreferrer"
                    href={buildLinkToReviewTableExportCSV(this.props.reviewCriteria, this.props.addedColumns)}
                    onClick={dropdown.toggleDropdownVisible}
                    className="mr-flex mr-items-center">
                    <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                    <FormattedMessage {...messages.exportReviewTableCSVLabel} />
                  </a> : 
                  <div>
                    <div className="mr-flex mr-items-center mr-opacity-50">
                      <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                      <FormattedMessage {...messages.exportReviewTableCSVLabel} />
                    </div>
                    <div className="mr-text-grey-light">
                      <FormattedMessage  {...messages.requiredForExport} />
                      <div />
                      <FormattedMessage  {...messages.requiredProject} />
                    </div>
                  </div>
                }
                <a target="_blank"
                   rel="noopener noreferrer"
                   href={buildLinkToMapperExportCSV(this.props.reviewCriteria)}
                   onClick={dropdown.toggleDropdownVisible}
                   className="mr-flex mr-items-center">
                  <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                  <FormattedMessage {...messages.exportMapperCSVLabel} />
                </a>
              </li>
            }
          </ul>
        }
      />
    )
  }

  clearFiltersControl = () => {
    return (
      <div className='mr-pb-2'>
      <button className="mr-flex mr-items-center mr-text-green-lighter mr-leading-loose hover:mr-text-white mr-transition-colors"
        onClick={() => this.props.clearFilterCriteria()}>
        <SvgSymbol sym="close-icon"
          viewBox='0 0 20 20'
          className="mr-fill-current mr-w-5 mr-h-5 mr-mr-1" />
        <FormattedMessage {...messages.clearFiltersLabel} />
      </button>
      </div>
    )
  }

  render() {
    // Setup tasks table. See react-table docs for details.
    const data = _get(this.props, 'reviewData.tasks', [])
    const pageSize = this.props.pageSize
    const columnTypes = setupColumnTypes({
                            ...this.props, 
                            updateChallengeFilterIds: this.updateChallengeFilterIds,
                            updateProjectFilterIds: this.updateProjectFilterIds,
                            challengeFilterIds: this.state.challengeFilterIds,
                            projectFilterIds: this.state.projectFilterIds
                           },
                           taskId => this.setState({openComments: taskId}),
                           data, this.props.reviewCriteria, pageSize)

    const totalRows = _get(this.props, 'reviewData.totalCount', 0)
    const totalPages = Math.ceil(totalRows / pageSize)

    let subheader = null
    const columns = _map(_keys(this.props.addedColumns), (column) => columnTypes[column])
    let defaultSorted = [{id: 'mappedOn', desc: false}]
    let defaultFiltered = []

    if (_get(this.props, 'reviewCriteria.sortCriteria.sortBy')) {
      defaultSorted = [{id: this.props.reviewCriteria.sortCriteria.sortBy,
                        desc: this.props.reviewCriteria.sortCriteria.direction === "DESC"}]
    }
    if (_get(this.props, 'reviewCriteria.filters')) {
      const reviewFilters = _cloneDeep(this.props.reviewCriteria.filters)

      // If we don't have a challenge name, make sure to populate it so
      // that the table filter will show it.
      if (this.props.reviewChallenges && !reviewFilters.challenge) {
        if (reviewFilters.challengeId || reviewFilters.challengeName) {
          reviewFilters.challenge = reviewFilters.challengeId ?
            _get(this.props.reviewChallenges[reviewFilters.challengeId],
                 'name') : reviewFilters.challengeName
        }
      }

      // If we don't have a project name, make sure to populate it so
      // that the table filter will show it.
      if (this.props.reviewProjects && !reviewFilters.project) {
        if (reviewFilters.projectId || reviewFilters.projectName) {
          reviewFilters.project = reviewFilters.projectId ?
            _get(this.props.reviewProjects[reviewFilters.projectId],
                 'displayName') : reviewFilters.projectName
        }
      }

      defaultFiltered = _map(reviewFilters,
                             (value, key) => {return {id: key, value}})
    }

    switch( this.props.reviewTasksType ) {
      case ReviewTasksType.reviewedByMe:
        subheader = this.props.reviewTasksSubType === "meta-reviewer" ?
          <FormattedMessage {...messages.tasksMetaReviewedByMe} /> :
          <FormattedMessage {...messages.tasksReviewedByMe} />
        break
      case ReviewTasksType.toBeReviewed:
        subheader = <FormattedMessage {...messages.tasksToBeReviewed} />
        break
      case ReviewTasksType.allReviewedTasks:
        subheader = <FormattedMessage {...messages.allReviewedTasks} />
        break
      case ReviewTasksType.metaReviewTasks:
        subheader = <FormattedMessage {...messages.tasksToMetaReview} />
        break
      case ReviewTasksType.myReviewedTasks:
      default:
        subheader = <FormattedMessage {...messages.myReviewTasks} />
        break
    }


    
    const BrowseMap = this.props.BrowseMap
    
    const IncludeMap = this.state.displayMap ? (
      <div className="mr-h-100 mr-mb-8">
        <MapPane>
          <BrowseMap {..._omit(this.props, ['className'])} />
        </MapPane>
      </div>
    ) : null;

    const checkBoxes = (
      this.props.reviewTasksType === ReviewTasksType.toBeReviewed && (
        <div className="xl:mr-flex mr-mr-4">
          <div className="field favorites-only-switch mr-mt-2 mr-mr-4" onClick={() => this.toggleShowFavorites()}>
            <input
              type="checkbox"
              id="only-saved-challenges-checkbox"
              className="mr-checkbox-toggle mr-mr-px"
              checked={!!this.props.reviewCriteria.savedChallengesOnly}
              onChange={() => null}
            />
            <label htmlFor="only-saved-challenges-checkbox"> {this.props.intl.formatMessage(messages.onlySavedChallenges)}</label>
          </div>
          <div className="field favorites-only-switch mr-mt-2" onClick={() => this.toggleExcludeOthers()}>
            <input
              type="checkbox"
              id="exclude-other-reviewers-checkbox"
              className="mr-checkbox-toggle mr-mr-px"
              checked={!!this.props.reviewCriteria.excludeOtherReviewers}
              onChange={() => null}
            />
            <label htmlFor="exclude-other-reviewers-checkbox"> {this.props.intl.formatMessage(messages.excludeOtherReviewers)}</label>
          </div>
        </div>
      )
    );
    
    return (
      <React.Fragment>
        <div className="mr-flex-grow mr-w-full mr-mx-auto mr-text-white mr-rounded mr-py-2 mr-px-6 md:mr-py-2 md:mr-px-8 mr-mb-12">
          <div className={IncludeMap === null ? 'sm:mr-flex sm:mr-items-center sm:mr-justify-between' : null}>
            <header className="sm:mr-flex sm:mr-items-center sm:mr-justify-between">
              <div>
                <h1 className={`mr-h2 mr-text-yellow md:mr-mr-4 ${BrowseMap === '' ? '' : 'mr-mb-4'}`}>
                  {subheader}
                </h1>
                {IncludeMap === null ? checkBoxes : null}
              </div>
            </header>
            {IncludeMap}
            <div className='sm:mr-flex sm:mr-items-center sm:mr-justify-between'>
              {IncludeMap === null ? null : checkBoxes}
              <div className="mr-ml-auto">
                {this.props.reviewTasksType === ReviewTasksType.toBeReviewed && data.length > 0 && (
                  <button className="mr-button mr-button-small mr-button--green-lighter mr-mr-4" onClick={() => this.startReviewing()}>
                    <FormattedMessage {...messages.startReviewing} />
                  </button>
                )}
                {this.props.reviewTasksType === ReviewTasksType.metaReviewTasks && data.length > 0 && (
                  <button className="mr-button mr-button-small mr-button--green-lighter mr-mr-4" onClick={() => this.startMetaReviewing()}>
                    <FormattedMessage {...messages.startMetaReviewing} />
                  </button>
                )}
                <button className="mr-button mr-button-small mr-button--green-lighter mr-mr-4"
                  onClick={() => {
                    const newDisplayMap = !this.state.displayMap;
                    localStorage.setItem('displayMap', JSON.stringify(newDisplayMap));
                    this.setState({ displayMap: newDisplayMap })
                  }}
                >
                  <FormattedMessage {...messages.toggleMap} />
                </button>
                <button
                  className={classNames("mr-button mr-button-small", {
                    "mr-button--green-lighter": !_get(this.props, 'reviewData.dataStale', false),
                    "mr-button--orange": _get(this.props, 'reviewData.dataStale', false)
                  })}
                  onClick={() => this.props.refresh()}
                >
                  <FormattedMessage {...messages.refresh} />
                </button>
                <div className="mr-float-right mr-mt-2 mr-ml-3">
                  <div className="mr-flex mr-justify-start mr-ml-4 mr-items-center mr-space-x-4">
                    {this.clearFiltersControl()}
                    {this.filterDropdown(this.props.reviewTasksType)}
                    {this.gearDropdown(this.props.reviewTasksType)}
                  </div>
                </div>
                <ManageSavedFilters searchFilters={this.props.reviewCriteria} {...this.props} />
                <SharedFiltersModal 
                  managingSharedFilterSettings={this.props.managingSharedFilterSettings}
                  cancelManagingSharedFilterSettings={this.props.cancelManagingSharedFilterSettings}
                  {...this.props} 
                />
              </div>
            </div>
          </div>
          <div className="mr-mt-6 review">
            <ReactTable
              data={data}
              columns={columns}
              key={this.props.reviewTasksType}
              pageSize={pageSize}
              totalCount={totalRows}
              defaultSorted={defaultSorted}
              defaultFiltered={defaultFiltered}
              minRows={1}
              manual
              multiSort={false}
              noDataText={<FormattedMessage {...messages.noTasks} />}
              pages={totalPages}
              onFetchData={(state, instance) => this.debouncedUpdateTasks(state, instance)}
              onPageSizeChange={pageSize => this.props.changePageSize(pageSize)}
              getTheadFilterThProps={() => {
                return { style: { position: "inherit", overflow: "inherit" } };
              }}
              onFilteredChange={filtered => {
                this.setState({ filtered });
                if (this.fetchData) {
                  this.fetchData();
                }
              }}
              loading={this.props.loading}
              {...intlTableProps(this.props.intl)}
              PaginationComponent={IntlTablePagination}
              FilterComponent={({ filter, onChange }) => {
                const filterValue = filter ? filter.value : ''
                const clearFilter = () => onChange('')
                return (
                  <div className='mr-space-x-1'>
                    <input
                      type="text"
                      style={{
                        width: '100%',
                      }}
                      value={filterValue}
                      onChange={event => {
                        onChange(event.target.value)
                      }}
                    />
                    {filterValue && (
                      <button className="mr-text-white hover:mr-text-green-lighter mr-transition-colors" onClick={clearFilter}>
                        <SvgSymbol sym="icon-close" viewBox="0 0 20 20" className="mr-fill-current mr-w-2.5 mr-h-2.5"/>
                      </button>
                    )}
                  </div>
                  )
                }
              }
            />
          </div>
        </div>
        {_isFinite(this.state.openComments) && (
          <TaskCommentsModal
            taskId={this.state.openComments}
            onClose={() => this.setState({ openComments: null })}
          />
        )}
        {this.state.showConfigureColumns && (
          <ConfigureColumnsModal
            {...this.props}
            onClose={() => this.setState({ showConfigureColumns: false })}
          />
        )}
      </React.Fragment>
    )
  }
}

export default WithCurrentUser(WithConfigurableColumns(
  WithSavedFilters(TaskReviewTable, "reviewSearchFilters"),
  {}, [], messages, "reviewColumns", "reviewTasksType", false)
)