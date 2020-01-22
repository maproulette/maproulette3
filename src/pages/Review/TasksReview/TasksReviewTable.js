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
import { TaskStatus, keysByStatus, messagesByStatus, isReviewableStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus, keysByReviewStatus, messagesByReviewStatus, isNeedsReviewStatus }
       from '../../../services/Task/TaskReview/TaskReviewStatus'
import { ReviewTasksType } from '../../../services/Task/TaskReview/TaskReview'
import TaskCommentsModal
       from '../../../components/TaskCommentsModal/TaskCommentsModal'
import ConfigureColumnsModal
       from '../../../components/ConfigureColumnsModal/ConfigureColumnsModal'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'
import Dropdown from '../../../components/Dropdown/Dropdown'
import IntlDatePicker from '../../../components/IntlDatePicker/IntlDatePicker'
import WithConfigurableColumns from '../../../components/HOCs/WithConfigurableColumns/WithConfigurableColumns'
import WithCurrentUser from '../../../components/HOCs/WithCurrentUser/WithCurrentUser'
import { mapColors } from '../../../interactions/User/AsEndUser'
import messages from './Messages'

import { Link } from 'react-router-dom'
import ReactTable from 'react-table'


/**
 * TaskReviewTable displays tasks that need to be reviewed or have been reviewed
 * as a table.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class TaskReviewTable extends Component {
  state = {
    openComments: null,
    showConfigureColumns: false,
  }

  debouncedUpdateTasks = _debounce(this.updateTasks, 100)

  updateTasks(tableState, instance) {
    const sortCriteria = {
      sortBy: tableState.sorted[0].id,
      direction: tableState.sorted[0].desc ? "DESC" : "ASC",
    }

    const filters = {}
    _each(tableState.filtered, (pair) => {filters[pair.id] = pair.value})

    this.props.updateReviewTasks({sortCriteria, filters, page: tableState.page,
                                  boundingBox: this.props.reviewCriteria.boundingBox})
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
                   "reviewCompleteControls":{permanent: true},
                   "reviewerControls":{permanent: true},
                   "mapperControls":{permanent: true},
                   "viewComments":{}}

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

  gearDropdown = () => {
    return (
      <Dropdown className="mr-dropdown--right"
          dropdownButton={dropdown => (
              <button onClick={dropdown.toggleDropdownVisible} className="mr-flex mr-items-center mr-text-green-light">
                  <SvgSymbol sym="cog-icon"
                      viewBox="0 0 20 20"
                      className="mr-fill-current mr-w-5 mr-h-5" />
              </button>
          )}
          dropdownContent={() =>
            <React.Fragment>
              <ul className="mr-list-dropdown">
                <li>
                    <button className="mr-text-current"
                            onClick={() => this.setState({showConfigureColumns: true})}>
                        <FormattedMessage {...messages.configureColumnsLabel} />
                    </button>
                </li>
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
        <div className="mr-flex-grow mr-w-full mr-mx-auto mr-bg-white mr-text-black mr-rounded mr-p-6 md:mr-p-8 mr-mb-12">
          <header className="sm:mr-flex sm:mr-items-center sm:mr-justify-between">
            <div>
              <h1 className="mr-h2 mr-text-blue-light md:mr-mr-4">
                {subheader}
              </h1>
              {this.props.reviewTasksType === ReviewTasksType.toBeReviewed &&
                <div className="mr-flex">
                  <div className="field favorites-only-switch mr-mt-2 mr-mr-4" onClick={() => this.toggleShowFavorites()}>
                    <input type="checkbox" className="mr-mr-px"
                           checked={!!this.props.reviewCriteria.savedChallengesOnly}
                           onChange={() => null} />
                    <label> {this.props.intl.formatMessage(messages.onlySavedChallenges)}</label>
                  </div>
                  <div className="field favorites-only-switch mr-mt-2" onClick={() => this.toggleExcludeOthers()}>
                    <input type="checkbox" className="mr-mr-px"
                           checked={!!this.props.reviewCriteria.excludeOtherReviewers}
                           onChange={() => null} />
                    <label> {this.props.intl.formatMessage(messages.excludeOtherReviewers)}</label>
                  </div>
                </div>
              }
            </div>
            <div>
              {this.props.reviewTasksType === ReviewTasksType.toBeReviewed && data.length > 0 &&
                <button className="mr-button mr-button-small mr-button--green mr-mr-4" onClick={() => this.startReviewing()}>
                  <FormattedMessage {...messages.startReviewing} />
                </button>
              }
              <button
                className={classNames(
                  "mr-button mr-button-small", {
                  "mr-button--green": !_get(this.props, 'reviewData.dataStale', false),
                  "mr-button--orange": _get(this.props, 'reviewData.dataStale', false)
                })}
                onClick={() => this.props.refresh()}
              >
                <FormattedMessage {...messages.refresh} />
              </button>
              <div className="mr-float-right mr-mt-3 mr-ml-3">{this.gearDropdown()}</div>
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
              className="mr-fill-current mr-w-3 mr-h-3 mr-absolute mr-pin-l mr--ml-2"
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
    Header: props.intl.formatMessage(messages.statusLabel),
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

  columns.reviewRequestedBy = {
    id: 'reviewRequestedBy',
    Header: props.intl.formatMessage(messages.reviewRequestedByLabel),
    accessor: 'reviewRequestedBy',
    filterable: true,
    sortable: false,
    exportable: t => _get(t.reviewRequestedBy, 'username'),
    maxWidth: 180,
    Cell: ({row}) =>
      <div className={classNames("row-user-column", mapColors(_get(row._original.reviewRequestedBy, 'username')))}>
        {_get(row._original.reviewRequestedBy, 'username')}
      </div>
  }

  columns.challenge = {
    id: 'challenge',
    Header: props.intl.formatMessage(messages.challengeLabel),
    accessor: 'parent',
    filterable: true,
    sortable: false,
    exportable: t => _get(t.parent, 'name'),
    minWidth: 120,
    Cell: ({row}) => {
      return (
        <div className="row-challenge-column mr-text-green">
          {row._original.parent.name}
        </div>
      )
    }
  }

  columns.project = {
    id: 'project',
    Header: props.intl.formatMessage(messages.projectLabel),
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
    Header: props.intl.formatMessage(messages.reviewedByLabel),
    accessor: 'reviewedBy',
    filterable: true,
    sortable: false,
    exportable: t => _get(t.reviewedBy, 'username'),
    maxWidth: 180,
    Cell: ({row}) =>
      <div className={classNames("row-user-column", mapColors(_get(row._original.reviewedBy, 'username')))}>
        {row._original.reviewedBy ? row._original.reviewedBy.username : "N/A"}
      </div>
  }

  columns.reviewStatus = {
    id: 'reviewStatus',
    Header: props.intl.formatMessage(messages.reviewStatusLabel),
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
          options.push(
            <option key={keysByReviewStatus[status]} value={status}>
              {props.intl.formatMessage(messagesByReviewStatus[status])}
            </option>
          )
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
        <div onClick={() => props.history.push(linkTo, criteria)} className="mr-text-green-light mr-cursor-pointer">
          <FormattedMessage {...messages.reviewTaskLabel} />
        </div>

      if (row._original.reviewedBy) {
        if (row._original.reviewStatus === TaskReviewStatus.needed) {
          action =
            <div onClick={() => props.history.push(linkTo, criteria)} className="mr-text-green-light mr-cursor-pointer">
              <FormattedMessage {...messages.reviewAgainTaskLabel} />
            </div>
        }
        else if (row._original.reviewStatus === TaskReviewStatus.disputed) {
          action =
            <div onClick={() => props.history.push(linkTo, criteria)} className="mr-text-green-light mr-cursor-pointer">
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
        <div onClick={() => props.history.push(linkTo, criteria)} className="mr-text-green-light mr-cursor-pointer">
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

      return <div className="row-controls-column">
        <Link to={linkTo}>
          {message}
        </Link>
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

  return columns
}

const StatusLabel = props => (
  <span
    className={classNames('mr-inline-flex mr-items-center', props.className)}
  >
    <span className="mr-w-2 mr-h-2 mr-rounded-full mr-bg-current" />
    <span className="mr-ml-2 mr-text-xs mr-uppercase mr-tracking-wide">
      <FormattedMessage {...props.intlMessage} />
    </span>
  </span>
)

const ViewCommentsButton = function(props) {
  return (
    <button
      onClick={props.onClick}
      className="mr-inline-flex mr-items-center mr-transition mr-text-green-light hover:mr-text-green"
    >
      <SvgSymbol
        sym="comments-icon"
        viewBox="0 0 20 20"
        className="mr-fill-current mr-w-4 mr-h-4"
      />
    </button>
  )
}

export default WithCurrentUser(WithConfigurableColumns(
  TaskReviewTable, {}, [], messages, "reviewColumns", "reviewTasksType", false))
