import React, { Component } from 'react'
import classNames from 'classnames'
import { FormattedMessage, FormattedDate, FormattedTime }
       from 'react-intl'
import parse from 'date-fns/parse'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _map from 'lodash/map'
import _isFinite from 'lodash/isFinite'
import _kebabCase from 'lodash/kebabCase'
import _debounce from 'lodash/debounce'
import _cloneDeep from 'lodash/cloneDeep'
import _keys from 'lodash/keys'
import _omit from 'lodash/omit'
import _pull from 'lodash/pull'
import _isEqual from 'lodash/isEqual'
import _isObject from 'lodash/isObject'
import _pick from 'lodash/pick'
import _isUndefined from 'lodash/isUndefined'
import { TaskStatus, keysByStatus, messagesByStatus, isReviewableStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskPriority, keysByPriority, messagesByPriority }
      from '../../../services/Task/TaskPriority/TaskPriority'
import { TaskReviewStatus, keysByReviewStatus, messagesByReviewStatus,
         messagesByMetaReviewStatus, isNeedsReviewStatus, isMetaReviewStatus }
       from '../../../services/Task/TaskReview/TaskReviewStatus'
import { ReviewTasksType, buildLinkToReviewTableExportCSV, buildLinkToMapperExportCSV } from '../../../services/Task/TaskReview/TaskReview'
import AsColoredHashable from '../../../interactions/Hashable/AsColoredHashable'
import { intlTableProps } from '../../../components/IntlTable/IntlTable'
import IntlTablePagination from '../../../components/IntlTable/IntlTablePagination'
import TaskCommentsModal
       from '../../../components/TaskCommentsModal/TaskCommentsModal'
import InTableTagFilter
       from '../../../components/KeywordAutosuggestInput/InTableTagFilter'
import ConfigureColumnsModal
       from '../../../components/ConfigureColumnsModal/ConfigureColumnsModal'
import FilterSuggestTextBox from './FilterSuggestTextBox'
import { FILTER_SEARCH_ALL, FILTER_SEARCH_TEXT } from './FilterSuggestTextBox'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'
import Dropdown from '../../../components/Dropdown/Dropdown'
import IntlDatePicker from '../../../components/IntlDatePicker/IntlDatePicker'
import WithConfigurableColumns from '../../../components/HOCs/WithConfigurableColumns/WithConfigurableColumns'
import WithCurrentUser from '../../../components/HOCs/WithCurrentUser/WithCurrentUser'
import messages from './Messages'
import { ViewCommentsButton, StatusLabel, makeInvertable }
  from '../../../components/TaskAnalysisTable/TaskTableHelpers'
import WithSavedFilters from '../../../components/HOCs/WithSavedFilters/WithSavedFilters'
import SavedFiltersList from '../../../components/SavedFilters/SavedFiltersList'
import ManageSavedFilters from '../../../components/SavedFilters/ManageSavedFilters'
import MapPane from '../../../components/EnhancedMap/MapPane/MapPane'
import { Link } from 'react-router-dom'
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
  componentIsMounted: false

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
      this.setState({lastTableState: _pick(tableState, ["sorted", "filtered"])})
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
                   "reviewStatus":{permanent: true},
                   "reviewRequestedBy":{},
                   "challenge":{},
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
              className="mr-text-green-lighter mr-mr-4">
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
            className="mr-text-green-lighter">
            <SvgSymbol sym="cog-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-5 mr-h-5" />
          </button>
        )}
        dropdownContent={(dropdown) =>
          <ul className="mr-list-dropdown mr-text-green-lighter mr-links-green-lighter">
            <li>
              <button
                className="mr-text-current"
                onClick={() => this.setState({showConfigureColumns: true})}
              >
                <FormattedMessage {...messages.configureColumnsLabel} />
              </button>
            </li>
            {(reviewTasksType === ReviewTasksType.allReviewedTasks || reviewTasksType === ReviewTasksType.toBeReviewed) &&
              <li onClick={dropdown.toggleDropdownVisible}>
                <a target="_blank"
                   rel="noopener noreferrer"
                   href={buildLinkToReviewTableExportCSV(this.props.reviewCriteria, this.props.addedColumns)}
                   className="mr-flex mr-items-center">
                  <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                  <FormattedMessage {...messages.exportReviewTableCSVLabel} />
                </a>
                <a target="_blank"
                   rel="noopener noreferrer"
                   href={buildLinkToMapperExportCSV(this.props.reviewCriteria)}
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
              className="mr-checkbox-toggle mr-mr-px"
              checked={!!this.props.reviewCriteria.savedChallengesOnly}
              onChange={() => null}
            />
            <label> {this.props.intl.formatMessage(messages.onlySavedChallenges)}</label>
          </div>
          <div className="field favorites-only-switch mr-mt-2" onClick={() => this.toggleExcludeOthers()}>
            <input
              type="checkbox"
              className="mr-checkbox-toggle mr-mr-px"
              checked={!!this.props.reviewCriteria.excludeOtherReviewers}
              onChange={() => null}
            />
            <label> {this.props.intl.formatMessage(messages.excludeOtherReviewers)}</label>
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
                <div className="mr-float-right mr-mt-3 mr-ml-3">
                  <div className="mr-flex mr-justify-start mr-ml-4">
                    {this.filterDropdown(this.props.reviewTasksType)}
                    {this.gearDropdown(this.props.reviewTasksType)}
                  </div>
                </div>
                <ManageSavedFilters searchFilters={this.props.reviewCriteria} {...this.props} />
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

export const setupColumnTypes = (props, openComments, data, criteria) => {
  const columns = {}
  columns.id = {
    id: 'id',
    Header: props.intl.formatMessage(messages.idLabel),
    filterable: true,
    accessor: t => {
      if (!t.isBundlePrimary) {
        return <span>{t.id}</span>
      }
      else {
        return (
          <span className="mr-flex mr-items-center">
            <SvgSymbol
              sym="box-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-3 mr-h-3 mr-absolute mr-left-0 mr--ml-2"
              title={props.intl.formatMessage(messages.multipleTasksTooltip)}
            />
            {t.id}
          </span>
        )
      }
    },
    sortable: true,
    exportable: t => t.id,
    maxWidth: 120,
  }

  columns.status = {
    id: 'status',
    Header: makeInvertable(props.intl.formatMessage(messages.statusLabel),
                           () => props.invertField('status'),
                           _get(criteria, 'invertFields.status')),
    accessor: 'status',
    sortable: true,
    filterable: true,
    exportable: t => props.intl.formatMessage(messagesByStatus[t.status]),
    maxWidth: 140,
    Cell: props => (
      <StatusLabel
        {...props}
        intlMessage={messagesByStatus[props.value]}
        className={`mr-status-${_kebabCase(keysByStatus[props.value])}`}
      />
    ),
    Filter: ({ filter, onChange }) => {
      const options = [
        <option key="all" value="all">All</option>
      ]

      _each(TaskStatus, (status) => {
        if (isReviewableStatus(status)) {
          options.push(
            <option key={keysByStatus[status]} value={status}>
              {props.intl.formatMessage(messagesByStatus[status])}
            </option>
          )
        }
      })

      return (
        <select
          onChange={event => onChange(event.target.value)}
          className={"mr-w-full"}
          value={filter ? filter.value : 'all'}
        >
          {options}
        </select>
      )
    },
  }

  columns.priority = {
    id: 'priority',
    Header: makeInvertable(props.intl.formatMessage(messages.priorityLabel),
                           () => props.invertField('priority'),
                           _get(criteria, 'invertFields.priority')),
    accessor: 'priority',
    sortable: true,
    filterable: true,
    exportable: t => props.intl.formatMessage(messagesByStatus[t.priority]),
    maxWidth: 140,
    Cell: props => (
      <StatusLabel
        {...props}
        intlMessage={messagesByPriority[props.value]}
        className={`mr-status-${_kebabCase(keysByPriority[props.value])}`}
      />
    ),
    Filter: ({ filter, onChange }) => {
      const options = [
        <option key="all" value="all">All</option>
      ]

      _each(TaskPriority, (priority) => {
        options.push(
          <option key={keysByPriority[priority]} value={priority}>
            {props.intl.formatMessage(messagesByPriority[priority])}
          </option>
        )
      })

      return (
        <select
          onChange={event => onChange(event.target.value)}
          className={"mr-w-full"}
          value={filter ? filter.value : 'all'}
        >
          {options}
        </select>
      )
    },
  }

  columns.reviewRequestedBy = {
    id: 'reviewRequestedBy',
    Header: makeInvertable(props.intl.formatMessage(messages.reviewRequestedByLabel),
                           () => props.invertField('reviewRequestedBy'),
                           _get(criteria, 'invertFields.reviewRequestedBy')),
    accessor: 'reviewRequestedBy',
    filterable: true,
    sortable: false,
    exportable: t => _get(t.reviewRequestedBy, 'username'),
    maxWidth: 180,
    Cell: ({row}) => (
      <div
        className="row-user-column"
        style={{color: AsColoredHashable(_get(row._original.reviewRequestedBy, 'username')).hashColor}}
      >
        {_get(row._original.reviewRequestedBy, 'username')}
      </div>
    ),
  }

  columns.additionalReviewers = {
    id: 'otherReviewers',
    Header: props.intl.formatMessage(messages.additionalReviewersLabel),
    accessor: 'additionalReviewers',
    sortable: false,
    filterable: false,
    maxWidth: 180,
    Cell: ({row}) => (
      <div
        className="row-user-column"
        style={{color: AsColoredHashable(_get(row._original.completedBy, 'username') || row._original.completedBy).hashColor}}
      >
        {_map(row._original.additionalReviewers, (reviewer, index) => {
          return (
            <React.Fragment key={reviewer + "-" + index}>
              <span style={{color: AsColoredHashable(reviewer.username).hashColor}}>{reviewer.username}</span>
              {(index + 1) !== _get(row._original.additionalReviewers, 'length') ? ", " : ""}
            </React.Fragment>
          )
        })}
      </div>
    ),
  }

  columns.challenge = {
    id: 'challenge',
    Header: makeInvertable(props.intl.formatMessage(messages.challengeLabel),
                           () => props.invertField('challenge'),
                           _get(criteria, 'invertFields.challenge')),
    accessor: 'parent',
    filterable: true,
    sortable: false,
    exportable: t => _get(t.parent, 'name'),
    minWidth: 120,
    Cell: ({row}) => {
      return (
        <div className="row-challenge-column mr-text-white">
          {row._original.parent.name}
        </div>
      )
    },
    Filter: ({ filter, onChange }) => {
      return (
        <FilterSuggestTextBox
          filterType={"challenge"}
          filterAllLabel={props.intl.formatMessage(messages.allChallenges)}
          selectedItem={""}
          onChange={(item) => {
            onChange(item)
            setTimeout(() => props.updateChallengeFilterIds(item), 0)
          }}
          value={filter ? filter.value : ""}
          itemList={props.reviewChallenges}
          multiselect={props.challengeFilterIds}
        />
      )
    }
  }

  columns.project = {
    id: 'project',
    Header: makeInvertable(props.intl.formatMessage(messages.projectLabel),
                           () => props.invertField('project'),
                           _get(criteria, 'invertFields.project')),
    filterable: true,
    sortable: false,
    exportable: t => _get(t.parent, 'parent.displayName'),
    minWidth: 120,
    Cell: ({row}) => {
      return (
        <div className="row-project-column">
          {row._original.parent.parent.displayName}
        </div>
      )
    },
    Filter: ({ filter, onChange }) => {
      return (
        <FilterSuggestTextBox
          filterType={"project"}
          filterAllLabel={props.intl.formatMessage(messages.allProjects)}
          selectedItem={""}
          onChange={(item) => {
            onChange(item)
            setTimeout(() => props.updateProjectFilterIds(item), 0)
          }}
          value={filter ? filter.value : ""}
          itemList={_map(props.reviewProjects, p => ({id: p.id, name: p.displayName}))}
          multiselect={props.projectFilterIds}
        />
      )
    }
  }

  columns.mappedOn = {
    id: 'mappedOn',
    Header: props.intl.formatMessage(messages.mappedOnLabel),
    accessor: 'mappedOn',
    sortable: true,
    filterable: true,
    defaultSortDesc: false,
    exportable: t => t.mappedOn,
    maxWidth: 180,
    Cell: props => {
      if (!props.value) {
        return null
      }
      return (
        <span>
          <FormattedDate value={props.value} /> <FormattedTime value={props.value} />
        </span>
      )
    },
    Filter: () => {
      let mappedOn = _get(criteria, 'filters.mappedOn')

      if (typeof mappedOn === "string" && mappedOn !== "") {
        mappedOn = parse(mappedOn)
      }
      return (
        <div>
          <IntlDatePicker
              selected={mappedOn}
              onChange={(value) => {
                props.setFiltered("mappedOn", value)
              }}
              intl={props.intl}
          />
        </div>
      )
    },
  }

  columns.reviewedAt = {
    id: 'reviewedAt',
    Header: props.intl.formatMessage(messages.reviewedAtLabel),
    accessor: 'reviewedAt',
    sortable: true,
    filterable: true,
    defaultSortDesc: false,
    exportable: t => t.reviewedAt,
    minWidth: 180,
    maxWidth: 200,
    Cell: props => {
      if (!props.value) {
        return null
      }

      return (
        <span>
          <FormattedDate value={props.value} /> <FormattedTime value={props.value} />
        </span>
      )
    },
    Filter: () => {
      let reviewedAt = _get(criteria, 'filters.reviewedAt')
      if (typeof reviewedAt === "string" && reviewedAt !== "") {
        reviewedAt = parse(reviewedAt)
      }
      return (
        <div>
          <IntlDatePicker
              selected={reviewedAt}
              onChange={(value) => {
                props.setFiltered("reviewedAt", value)
              }}
              intl={props.intl}
          />
        </div>
      )
    },
  }

  columns.metaReviewedAt = {
    id: 'metaReviewedAt',
    Header: props.intl.formatMessage(messages.metaReviewedAtLabel),
    accessor: 'metaReviewedAt',
    sortable: true,
    filterable: false,
    defaultSortDesc: false,
    exportable: t => t.metaReviewedAt,
    minWidth: 180,
    maxWidth: 200,
    Cell: props => {
      if (!props.value) {
        return null
      }

      return (
        <span>
          <FormattedDate value={props.value} /> <FormattedTime value={props.value} />
        </span>
      )
    }
  }

  columns.reviewedBy = {
    id: 'reviewedBy',
    Header: makeInvertable(props.intl.formatMessage(messages.reviewedByLabel),
                           () => props.invertField('reviewedBy'),
                           _get(criteria, 'invertFields.reviewedBy')),
    accessor: 'reviewedBy',
    filterable: true,
    sortable: false,
    exportable: t => _get(t.reviewedBy, 'username'),
    maxWidth: 180,
    Cell: ({row}) => (
      <div
        className="row-user-column"
        style={{color: AsColoredHashable(_get(row._original.reviewedBy, 'username')).hashColor}}
      >
        {row._original.reviewedBy ? row._original.reviewedBy.username : "N/A"}
      </div>
    ),
  }

  columns.reviewStatus = {
    id: 'reviewStatus',
    Header: makeInvertable(props.intl.formatMessage(messages.reviewStatusLabel),
                           () => props.invertField('reviewStatus'),
                           _get(criteria, 'invertFields.reviewStatus')),
    accessor: 'reviewStatus',
    sortable: true,
    filterable: true,
    exportable: t => props.intl.formatMessage(messagesByReviewStatus[t.reviewStatus]),
    maxWidth: 180,
    Cell: props => (
      <StatusLabel
        {...props}
        intlMessage={messagesByReviewStatus[props.value]}
        className={`mr-review-${_kebabCase(keysByReviewStatus[props.value])}`}
      />
    ),
    Filter: ({ filter, onChange }) => {
      const options = [
        <option key="all" value="all">All</option>
      ]

      if (props.reviewTasksType === ReviewTasksType.metaReviewTasks) {
        _each([TaskReviewStatus.approved,
               TaskReviewStatus.approvedWithFixes], status =>
          options.push(
            <option key={keysByReviewStatus[status]} value={status}>
              {props.intl.formatMessage(messagesByReviewStatus[status])}
            </option>
          )
        )
      }
      else if (props.reviewTasksType === ReviewTasksType.reviewedByMe ||
          props.reviewTasksType === ReviewTasksType.myReviewedTasks ||
          props.reviewTasksType === ReviewTasksType.allReviewedTasks) {
        _each(TaskReviewStatus, (status) => {
          if (status !== TaskReviewStatus.unnecessary) {
            options.push(
              <option key={keysByReviewStatus[status]} value={status}>
                {props.intl.formatMessage(messagesByReviewStatus[status])}
              </option>
            )
          }
        })
      }
      else {
        _each(TaskReviewStatus, (status) => {
          if (isNeedsReviewStatus(status)) {
            options.push(
              <option key={keysByReviewStatus[status]} value={status}>
                {props.intl.formatMessage(messagesByReviewStatus[status])}
              </option>
            )
          }
        })
      }

      return (
        <select
          onChange={event => onChange(event.target.value)}
          className={"mr-w-full"}
          value={filter ? filter.value : 'all'}
        >
          {options}
        </select>
      )
    },
  }

  columns.metaReviewStatus = {
    id: 'metaReviewStatus',
    Header: makeInvertable(props.intl.formatMessage(messages.metaReviewStatusLabel),
                           () => props.invertField('metaReviewStatus'),
                           _get(criteria, 'invertFields.metaReviewStatus')),
    accessor: 'metaReviewStatus',
    sortable: true,
    filterable: true,
    exportable: t => props.intl.formatMessage(messagesByMetaReviewStatus[t.metaReviewStatus]),
    maxWidth: 180,
    Cell: props => (_isUndefined(props.value) ? "" :
      <StatusLabel
        {...props}
        intlMessage={messagesByMetaReviewStatus[props.value]}
        className={`mr-review-${_kebabCase(keysByReviewStatus[props.value])}`}
      />
    ),
    Filter: ({ filter, onChange }) => {
      const options = [
      ]

      if (props.reviewTasksType === ReviewTasksType.metaReviewTasks) {
        options.push(<option key="all" value="0,-2">{props.intl.formatMessage(messages.allNeeded)}</option>)
        options.push(<option key="none" value="-2">{props.intl.formatMessage(messages.metaUnreviewed)}</option>)
        options.push(
          <option key={keysByReviewStatus[TaskReviewStatus.needed]} value={TaskReviewStatus.needed}>
            {props.intl.formatMessage(messagesByMetaReviewStatus[TaskReviewStatus.needed])}
          </option>
        )
      }
      else {
        options.push(<option key="all" value="all">All</option>)
        options.push(<option key="none" value="-2">{props.intl.formatMessage(messages.metaUnreviewed)}</option>)
        _each(TaskReviewStatus, (status) => {
          if (status !== TaskReviewStatus.unnecessary &&
              isMetaReviewStatus(status)) {

            options.push(
              <option key={keysByReviewStatus[status]} value={status}>
                {props.intl.formatMessage(messagesByMetaReviewStatus[status])}
              </option>
            )
          }
        })
      }

      return (
        <select
          onChange={event => onChange(event.target.value)}
          className={"mr-w-full"}
          value={filter ? filter.value : 'all'}
        >
          {options}
        </select>
      )
    },
  }

  columns.metaReviewedBy = {
    id: 'metaReviewedBy',
    Header: makeInvertable(props.intl.formatMessage(messages.metaReviewedByLabel),
                           () => props.invertField('metaReviewedBy'),
                           _get(criteria, 'invertFields.metaReviewedBy')),
    accessor: 'metaReviewedBy',
    filterable: true,
    sortable: false,
    exportable: t => _get(t.metaReviewedBy, 'username'),
    maxWidth: 180,
    Cell: ({row}) => (
      <div
        className="row-user-column"
        style={{color: AsColoredHashable(_get(row._original.metaReviewedBy, 'username')).hashColor}}
      >
        {row._original.metaReviewedBy ? row._original.metaReviewedBy.username : ""}
      </div>
    ),
  }

  columns.reviewerControls = {
    id: 'controls',
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    sortable: false,
    maxWidth: 120,
    minWidth: 110,
    Cell: ({row}) =>{
      const linkTo =`/challenge/${row._original.parent.id}/task/${row._original.id}/review`
      let action =
        <div onClick={() => props.history.push(linkTo, criteria)} className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition">
          <FormattedMessage {...messages.reviewTaskLabel} />
        </div>

      if (row._original.reviewedBy) {
        if (row._original.reviewStatus === TaskReviewStatus.needed) {
          action =
            <div onClick={() => props.history.push(linkTo, criteria)} className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition">
              <FormattedMessage {...messages.reviewAgainTaskLabel} />
            </div>
        }
        else if (row._original.reviewStatus === TaskReviewStatus.disputed) {
          action =
            <div onClick={() => props.history.push(linkTo, criteria)} className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition">
              <FormattedMessage {...messages.resolveTaskLabel} />
            </div>
        }
      }

      return <div className="row-controls-column">
              {action}
            </div>
    }
  }

  columns.reviewCompleteControls = {
    id: 'controls',
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    sortable: false,
    maxWidth: 110,
    Cell: ({row}) =>{
      let linkTo = `/challenge/${row._original.parent.id}/task/${row._original.id}`
      let message = <FormattedMessage {...messages.viewTaskLabel} />

      // The mapper needs to rereview a contested task.
      if (row._original.reviewStatus === TaskReviewStatus.disputed ||
          row._original.metaReviewStatus === TaskReviewStatus.rejected) {
        linkTo += "/review"
        message = <FormattedMessage {...messages.resolveTaskLabel} />
      }

      return <div className="row-controls-column">
        <div onClick={() => props.history.push(linkTo, criteria)} className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition">
          {message}
        </div>
      </div>
    }
  }

  columns.metaReviewerControls = {
    id: 'controls',
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    sortable: false,
    maxWidth: 120,
    minWidth: 110,
    Cell: ({row}) =>{
      const linkTo =`/challenge/${row._original.parent.id}/task/${row._original.id}/meta-review`
      let action =
        <div onClick={() => props.history.push(linkTo, criteria)} className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition">
          <FormattedMessage {...messages.metaReviewTaskLabel} />
        </div>

      if (row._original.reviewedBy) {
        if (row._original.reviewStatus === TaskReviewStatus.needed) {
          action =
            <div onClick={() => props.history.push(linkTo, criteria)} className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition">
              <FormattedMessage {...messages.reviewAgainTaskLabel} />
            </div>
        }
        else if (row._original.reviewStatus === TaskReviewStatus.disputed) {
          action =
            <div onClick={() => props.history.push(linkTo, criteria)} className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition">
              <FormattedMessage {...messages.resolveTaskLabel} />
            </div>
        }
      }

      return <div className="row-controls-column">
              {action}
            </div>
    }
  }

  columns.mapperControls = {
    id: 'controls',
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    sortable: false,
    minWidth: 90,
    maxWidth: 120,
    Cell: ({row}) =>{
      let linkTo = `/challenge/${row._original.parent.id}/task/${row._original.id}`
      let message = row._original.reviewStatus === TaskReviewStatus.rejected ?
                        <FormattedMessage {...messages.fixTaskLabel} /> :
                        <FormattedMessage {...messages.viewTaskLabel} />

      return <div className="row-controls-column mr-links-green-lighter">
        <Link to={linkTo}>
          {message}
        </Link>
        {!props.metaReviewEnabled &&
         row._original.reviewStatus !== TaskReviewStatus.needed &&
         row._original.reviewedBy && row._original.reviewedBy.id !== props.user.id &&
          <div onClick={() => props.history.push(linkTo + "/review", criteria)} className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition">
            <FormattedMessage {...messages.reviewFurtherTaskLabel} />
          </div>
        }
      </div>
    }
  }

  columns.viewComments = {
    id: 'viewComments',
    Header: () => <FormattedMessage {...messages.viewCommentsLabel} />,
    accessor: 'commentID',
    sortable: false,
    maxWidth: 110,
    Cell: props =>
      <ViewCommentsButton onClick={() => openComments(props.row._original.id)} />,
  }

  columns.tags = {
    id: 'tags',
    Header: props.intl.formatMessage(messages.tagsLabel),
    accessor: 'tags',
    filterable: true,
    sortable: false,
    minWidth: 120,
    Cell: ({row}) => {
      return (
        <div className="row-challenge-column mr-text-white mr-whitespace-normal mr-flex mr-flex-wrap">
          {_map(row._original.tags, t => t.name === "" ? null : (
            <div className="mr-inline mr-bg-white-10 mr-rounded mr-py-1 mr-px-2 mr-m-1" key={t.id}>
              {t.name}
            </div>
          ))}
        </div>
      )
    },
    Filter: ({filter, onChange}) => {
      return (
        <InTableTagFilter
          {...props}
          onChange={onChange}
          value={_get(filter, 'value')}
        />
      )
    }
  }

  return columns
}

export default WithCurrentUser(WithConfigurableColumns(
  WithSavedFilters(TaskReviewTable, "reviewSearchFilters"),
  {}, [], messages, "reviewColumns", "reviewTasksType", false)
)