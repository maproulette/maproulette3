import React, { Component } from 'react'
import classNames from 'classnames'
import { FormattedMessage, FormattedDate, FormattedTime }
       from 'react-intl'
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
import _isObject from 'lodash/isObject'
import _pick from 'lodash/pick'
import { TaskStatus, keysByStatus, messagesByStatus, isReviewableStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskPriority, keysByPriority, messagesByPriority }
      from '../../../services/Task/TaskPriority/TaskPriority'
import { TaskReviewStatus, keysByReviewStatus, messagesByReviewStatus, isNeedsReviewStatus }
       from '../../../services/Task/TaskReview/TaskReviewStatus'
import { ReviewTasksType, buildLinkToMapperExportCSV } from '../../../services/Task/TaskReview/TaskReview'
import TaskCommentsModal
       from '../../../components/TaskCommentsModal/TaskCommentsModal'
import InTableTagFilter
       from '../../../components/KeywordAutosuggestInput/InTableTagFilter'
import ConfigureColumnsModal
       from '../../../components/ConfigureColumnsModal/ConfigureColumnsModal'
import FilterSuggestTextBox from './FilterSuggestTextBox'
import { FILTER_SEARCH_ALL } from './FilterSuggestTextBox'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'
import Dropdown from '../../../components/Dropdown/Dropdown'
import IntlDatePicker from '../../../components/IntlDatePicker/IntlDatePicker'
import WithConfigurableColumns from '../../../components/HOCs/WithConfigurableColumns/WithConfigurableColumns'
import WithCurrentUser from '../../../components/HOCs/WithCurrentUser/WithCurrentUser'
import { mapColors } from '../../../interactions/User/AsEndUser'
import messages from './Messages'
import { ViewCommentsButton, StatusLabel, makeInvertable }
  from '../../../components/TaskAnalysisTable/TaskTableHelpers'
import { Link } from 'react-router-dom'
import ReactTable from 'react-table-6'


/**
 * TaskReviewTable displays tasks that need to be reviewed or have been reviewed
 * as a table.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class TaskReviewTable extends Component {
  state = {
    openComments: null,
    showConfigureColumns: false
  }

  debouncedUpdateTasks = _debounce(this.updateTasks, 100)

  updateTasks(tableState, instance) {
    const sortCriteria = {
      sortBy: tableState.sorted[0].id,
      direction: tableState.sorted[0].desc ? "DESC" : "ASC",
    }

    const filters = {}
    _each(tableState.filtered, (pair) => {filters[pair.id] = pair.value})

    // Determine if we can search by challenge Id or do name search
    if (filters.challenge) {
      if (_isObject(filters.challenge)) {
        if (filters.challenge.id === FILTER_SEARCH_ALL) {
          // Search all
          filters.challengeId = null
          filters.challenge = null
        }
        else {
          if (filters.challenge.id > 0) {
            filters.challengeId = filters.challenge.id
          }
          else if (_get(this.props.reviewCriteria, 'filters.challengeId') ===
                     filters.challengeId &&
                   _get(this.props.reviewCriteria, 'filters.challenge') !==
                     filters.challenge) {
            // We must be doing a partial search and can't search by id. Our
            // prior id is invalid.
            filters.challengeId = null
          }

          filters.challenge = filters.challenge.name
        }
      }
    }

    // Determine if we can search by project Id or do name search
    if (filters.project) {
      if (_isObject(filters.project)) {
        if (filters.project.id === FILTER_SEARCH_ALL) {
          // Search all
          filters.projectId = null
          filters.project = null
        }
        else {
          if (filters.project.id > 0) {
            filters.projectId = filters.project.id
          }
          else if (_get(this.props.reviewCriteria, 'filters.projectId') ===
                     filters.projectId &&
                   _get(this.props.reviewCriteria, 'filters.project') !==
                     filters.project) {
            // We must be doing a partial search and can't search by id. Our
            // prior id is invalid.
            filters.projectId = null
          }

          filters.project = filters.project.name
        }
      }
    }

    this.setState({lastTableState: _pick(tableState, ["sorted", "filtered"])})
    this.props.updateReviewTasks({sortCriteria, filters, page: tableState.page,
      boundingBox: this.props.reviewCriteria.boundingBox,
      includeTags: !!_get(this.props.addedColumns, 'tags')})
  }

  startReviewing() {
    this.props.startReviewing(this.props.history)
  }

  toggleShowFavorites(event) {
    const reviewCriteria = _cloneDeep(this.props.reviewCriteria)
    reviewCriteria.savedChallengesOnly = !reviewCriteria.savedChallengesOnly
    this.props.updateReviewTasks(reviewCriteria)
  }

  toggleExcludeOthers(event) {
    const reviewCriteria = _cloneDeep(this.props.reviewCriteria)
    reviewCriteria.excludeOtherReviewers = !reviewCriteria.excludeOtherReviewers
    this.props.updateReviewTasks(reviewCriteria)
  }

  componentDidMount() {
    this.setupConfigurableColumns(this.props.reviewTasksType)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.reviewTasksType !== this.props.reviewTasksType) {
      this.setupConfigurableColumns(this.props.reviewTasksType)
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
                   "tags":{}}

    let defaultColumns = _keys(columns)

    // Remove any columns not relevant to the current tab.
    switch(reviewTasksType) {
      case ReviewTasksType.reviewedByMe:
        columns = _omit(columns,  ["reviewedBy", "reviewerControls", "mapperControls"])
        defaultColumns = _pull(defaultColumns, ...["reviewedBy", "reviewerControls", "mapperControls"])

        break
      case ReviewTasksType.toBeReviewed:
        columns = _omit(columns,  ["reviewCompleteControls", "mapperControls"])
        defaultColumns = _pull(defaultColumns, ...["reviewCompleteControls", "mapperControls"])

        break
      case ReviewTasksType.allReviewedTasks:
        columns = _omit(columns,  ["reviewCompleteControls", "reviewerControls"])
        defaultColumns = _pull(defaultColumns, ...["reviewCompleteControls", "reviewerControls"])

        break
      case ReviewTasksType.myReviewedTasks:
      default:
        columns = _omit(columns,  ["reviewRequestedBy", "reviewCompleteControls", "reviewerControls"])
        defaultColumns = _pull(defaultColumns, ...["reviewRequestedBy", "reviewCompleteControls", "reviewerControls"])

        break
    }

    this.props.resetColumnChoices(columns, defaultColumns)
  }

  gearDropdown = (reviewTasksType) => {
    return (
      <Dropdown className="mr-dropdown--right"
          dropdownButton={dropdown => (
              <button onClick={dropdown.toggleDropdownVisible} className="mr-flex mr-items-center mr-text-green-lighter">
                  <SvgSymbol sym="cog-icon"
                      viewBox="0 0 20 20"
                      className="mr-fill-current mr-w-5 mr-h-5" />
              </button>
          )}
          dropdownContent={(dropdown) =>
            <React.Fragment>
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
                        href={buildLinkToMapperExportCSV(this.props.reviewCriteria)}
                        className="mr-flex mr-items-center"
                    >
                        <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                        <FormattedMessage {...messages.exportMapperCSVLabel} />
                    </a>
                  </li>
                }
              </ul>
            </React.Fragment>
          }
      />
    )
  }

  render() {
    // Setup tasks table. See react-table docs for details.
    const data = _get(this.props, 'reviewData.tasks', [])
    const pageSize = this.props.pageSize
    const columnTypes = setupColumnTypes(this.props,
                           taskId => this.setState({openComments: taskId}),
                           data, this.props.reviewCriteria, pageSize)

    const totalPages = Math.ceil(_get(this.props, 'reviewData.totalCount', 0) / pageSize)

    let subheader = null
    const columns = _map(_keys(this.props.addedColumns), (column) => columnTypes[column])
    let defaultSorted = [{id: 'mappedOn', desc: false}]
    let defaultFiltered = []

    if (_get(this.props, 'reviewCriteria.sortCriteria.sortBy')) {
      defaultSorted = [{id: this.props.reviewCriteria.sortCriteria.sortBy,
                        desc: this.props.reviewCriteria.sortCriteria.direction === "DESC"}]
    }
    if (_get(this.props, 'reviewCriteria.filters')) {
      defaultFiltered = _map(this.props.reviewCriteria.filters,
                             (value, key) => {return {id: key, value}})
    }

    switch( this.props.reviewTasksType ) {
      case ReviewTasksType.reviewedByMe:
        subheader = <FormattedMessage {...messages.tasksReviewedByMe} />
        break
      case ReviewTasksType.toBeReviewed:
        subheader = <FormattedMessage {...messages.tasksToBeReviewed} />
        break
      case ReviewTasksType.allReviewedTasks:
        subheader = <FormattedMessage {...messages.allReviewedTasks} />
        break
      case ReviewTasksType.myReviewedTasks:
      default:
        subheader = <FormattedMessage {...messages.myReviewTasks} />
        break
    }

    return (
      <React.Fragment>
        <div className="mr-flex-grow mr-w-full mr-mx-auto mr-text-white mr-rounded mr-py-2 mr-px-6 md:mr-py-2 md:mr-px-8 mr-mb-12">
          <header className="sm:mr-flex sm:mr-items-center sm:mr-justify-between">
            <div>
              <h1 className="mr-h2 mr-text-yellow md:mr-mr-4">
                {subheader}
              </h1>
              {this.props.reviewTasksType === ReviewTasksType.toBeReviewed &&
                <div className="mr-flex">
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
              }
            </div>
            <div>
              {this.props.reviewTasksType === ReviewTasksType.toBeReviewed && data.length > 0 &&
                <button className="mr-button mr-button-small mr-button--green-lighter mr-mr-4" onClick={() => this.startReviewing()}>
                  <FormattedMessage {...messages.startReviewing} />
                </button>
              }
              <button
                className={classNames(
                  "mr-button mr-button-small", {
                  "mr-button--green-lighter": !_get(this.props, 'reviewData.dataStale', false),
                  "mr-button--orange": _get(this.props, 'reviewData.dataStale', false)
                })}
                onClick={() => this.props.refresh()}
              >
                <FormattedMessage {...messages.refresh} />
              </button>
              <div className="mr-float-right mr-mt-3 mr-ml-3">{this.gearDropdown(this.props.reviewTasksType)}</div>
            </div>
          </header>
          <div className="mr-mt-6">
            <ReactTable data={data} columns={columns} key={this.props.reviewTasksType}
                        pageSize={pageSize}
                        defaultSorted={defaultSorted}
                        defaultFiltered={defaultFiltered}
                        minRows={1}
                        manual
                        multiSort={false}
                        noDataText={<FormattedMessage {...messages.noTasks} />}
                        pages={totalPages}
                        onFetchData={(state, instance) => this.debouncedUpdateTasks(state, instance)}
                        onPageSizeChange={(pageSize, pageIndex) => this.props.changePageSize(pageSize)}
                        getTheadFilterThProps={(state, rowInfo, column) => {
                          return {style: {position: "inherit", overflow: "inherit"}}}
                        }
                        onFilteredChange={filtered => {
                          this.setState({ filtered })
                          if (this.fetchData) {
                            this.fetchData()
                          }
                        }}
                        loading={this.props.loading}
            />
          </div>
        </div>
        {_isFinite(this.state.openComments) &&
         <TaskCommentsModal
           taskId={this.state.openComments}
           onClose={() => this.setState({openComments: null})}
         />
        }
        {this.state.showConfigureColumns &&
         <ConfigureColumnsModal
           {...this.props}
           onClose={() => this.setState({showConfigureColumns: false})}
         />
        }
      </React.Fragment>
    )
  }
}

const setupColumnTypes = (props, openComments, data, criteria, pageSize) => {
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
          style={{ width: '100%' }}
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
          style={{ width: '100%' }}
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
        style={{color: mapColors(_get(row._original.reviewRequestedBy, 'username'))}}
      >
        {_get(row._original.reviewRequestedBy, 'username')}
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
          onChange={onChange}
          value={filter ? filter.value : ""}
          itemList={props.reviewChallenges}
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
          onChange={onChange}
          value={filter ? filter.value : ""}
          itemList={_map(props.reviewProjects, p => ({id: p.id, name: p.displayName}))}
        />
      )
    }
  }

  columns.mappedOn = {
    id: 'mappedOn',
    Header: props.intl.formatMessage(messages.mappedOnLabel),
    accessor: 'mappedOn',
    sortable: true,
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
    }
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
    Filter: ({ filter, onChange }) =>
      <div>
        <IntlDatePicker
            selected={_get(criteria, 'filters.reviewedAt')}
            onChange={(value) => {
              props.setFiltered("reviewedAt", value)
            }}
            intl={props.intl}
        />
      </div>,
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
        style={{color: mapColors(_get(row._original.reviewedBy, 'username'))}}
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

      if (props.reviewTasksType === ReviewTasksType.reviewedByMe ||
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
          style={{ width: '100%' }}
          value={filter ? filter.value : 'all'}
        >
          {options}
        </select>
      )
    },
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
      if (row._original.reviewStatus === TaskReviewStatus.disputed) {
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
        {row._original.reviewStatus !== TaskReviewStatus.needed &&
         row._original.reviewedBy && row._original.reviewedBy.id !== props.user.id &&
          <div onClick={() => props.history.push(linkTo + "/review", criteria)} className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition">
            <FormattedMessage {...messages.metaReviewTaskLabel} />
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
  TaskReviewTable, {}, [], messages, "reviewColumns", "reviewTasksType", false))
