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
import { TaskStatus, keysByStatus, messagesByStatus, isReviewableStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus, keysByReviewStatus, messagesByReviewStatus, isNeedsReviewStatus }
       from '../../../services/Task/TaskReview/TaskReviewStatus'
import { ReviewTasksType } from '../../../services/Task/TaskReview/TaskReview'
import TaskCommentsModal
       from '../../../components/TaskCommentsModal/TaskCommentsModal'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'
import IntlDatePicker from '../../../components/IntlDatePicker/IntlDatePicker'
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
                                  boundingBox: this.props.reviewCriteria.boundingBox},
                                  tableState.pageSize)
  }

  startReviewing() {
    this.props.startReviewing(this.props.history)
  }

  componentDidMount() {
  }

  render() {
    // Setup tasks table. See react-table docs for details.
    const data = _get(this.props, 'reviewData.tasks', [])
    const columnTypes = setupColumnTypes(this.props,
                           taskId => this.setState({openComments: taskId}),
                           (id, value) => this.setState({filtered: [{id: id, value: value}]}),
                           data, this.props.reviewCriteria)
    const pageSize = this.props.pageSize
    const totalPages = Math.ceil(_get(this.props, 'reviewData.totalCount', 0) / pageSize)

    let subheader = null
    let columns = null
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
        columns = [columnTypes.id, columnTypes.reviewStatus, columnTypes.reviewRequestedBy,
                   columnTypes.challenge, columnTypes.mappedOn, columnTypes.reviewedAt,
                   columnTypes.status, columnTypes.reviewCompleteControls, columnTypes.viewComments]
        break
      case ReviewTasksType.toBeReviewed:
        subheader = <FormattedMessage {...messages.tasksToBeReviewed} />
        columns = [columnTypes.id, columnTypes.reviewStatus, columnTypes.reviewRequestedBy,
                   columnTypes.challenge, columnTypes.mappedOn, columnTypes.reviewedBy,
                   columnTypes.reviewedAt, columnTypes.status, columnTypes.reviewerControls,
                   columnTypes.viewComments]
        break
      case ReviewTasksType.myReviewedTasks:
      default:
        subheader = <FormattedMessage {...messages.myReviewTasks} />
        columns = [columnTypes.id, columnTypes.reviewStatus, columnTypes.challenge,
                   columnTypes.mappedOn, columnTypes.reviewedBy, columnTypes.reviewedAt,
                   columnTypes.status, columnTypes.mapperControls, columnTypes.viewComments]
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
            </div>
          </header>
          <div className="mr-mt-6">
            <ReactTable data={data} columns={columns} key={this.props.reviewTasksType}
                        defaultPageSize={pageSize}
                        defaultSorted={defaultSorted}
                        defaultFiltered={defaultFiltered}
                        minRows={1}
                        manual
                        multiSort={false}
                        noDataText={<FormattedMessage {...messages.noTasks} />}
                        pages={totalPages}
                        onFetchData={(state, instance) => this.debouncedUpdateTasks(state, instance)}
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
      </React.Fragment>
    )
  }
}

const setupColumnTypes = (props, openComments, setFiltered, data, criteria) => {
  const columns = {}
  columns.id = {
    id: 'id',
    Header: props.intl.formatMessage(messages.idLabel),
    accessor: 'id',
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
    Header: props.intl.formatMessage(messages.mappedByLabel),
    accessor: 'reviewRequestedBy',
    filterable: true,
    sortable: false,
    exportable: t => _get(t.reviewRequestedBy, 'username'),
    maxWidth: 180,
    Cell: ({row}) =>
      <div className="row-user-column">
        {row._original.reviewRequestedBy.username}
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
      let linkTo =`/challenge/${row._original.parent.id}/task/${row.id}/review?`
      if (_get(criteria, 'sortCriteria.sortBy')) {
        linkTo += `sortBy=${criteria.sortCriteria.sortBy}&direction=${criteria.sortCriteria.direction}&`
      }

      if (_get(criteria, 'filters')) {
        linkTo += `filters=${encodeURIComponent(JSON.stringify(criteria.filters))}&`
      }

      if (_get(criteria, 'boundingBox')) {
        linkTo += `boundingBox=${criteria.boundingBox}`
      }

      return (
        <div className="row-challenge-column">
          <Link
            to={linkTo}
            title={row._original.parent.name}
          >
            {row._original.parent.name}
          </Link>
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
    Cell: props => (
      props.value &&
        <span>
          <FormattedDate value={props.value} /> <FormattedTime value={props.value} />
        </span>

    )
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
    Cell: props => (
      props.value &&
        <span>
          <FormattedDate value={props.value} /> <FormattedTime value={props.value} />
        </span>

    ),
    Filter: ({ filter, onChange }) =>
      <div>
        <IntlDatePicker
            selected={_get(criteria, 'filters.reviewedAt')}
            onChange={(value) => {
              setFiltered("reviewedAt", value)
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
      <div className="row-user-column">
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
          props.reviewTasksType === ReviewTasksType.myReviewedTasks) {
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
      let linkTo =`/challenge/${row._original.parent.id}/task/${row.id}/review?`
      if (_get(criteria, 'sortCriteria.sortBy')) {
        linkTo += `sortBy=${criteria.sortCriteria.sortBy}&direction=${criteria.sortCriteria.direction}&`
      }

      if (criteria.filters) {
        linkTo += `filters=${encodeURIComponent(JSON.stringify(criteria.filters))}`
      }

      let action =
            <Link to={linkTo}>
              <FormattedMessage {...messages.reviewTaskLabel} />
            </Link>

      if (row._original.reviewedBy) {
        if (row._original.reviewStatus === TaskReviewStatus.needed) {
          action =
            <Link to={linkTo}>
              <FormattedMessage {...messages.reviewAgainTaskLabel} />
            </Link>
        }
        else if (row._original.reviewStatus === TaskReviewStatus.disputed) {
          if (row._original.reviewedBy.id !== props.user.id) {
            action =
              <Link to={linkTo}>
                <FormattedMessage {...messages.resolveTaskLabel} />
              </Link>
          }
          else {
            action =
              <span className="mr-text-grey-light">
                <FormattedMessage {...messages.resolveTaskLabel}/>
              </span>
          }
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
      return <div className="row-controls-column">
        <Link to={`/challenge/${row._original.parent.id}/task/${row.id}`}>
          <FormattedMessage {...messages.viewTaskLabel} />
        </Link>
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
      return <div className="row-controls-column">
        <Link to={`/challenge/${row._original.parent.id}/task/${row.id}`}>
          {row._original.reviewStatus === 2 ?
              <FormattedMessage {...messages.fixTaskLabel} /> :
              <FormattedMessage {...messages.viewTaskLabel} /> }
        </Link>
      </div>
    }
  }

  columns.viewComments = {
    id: 'viewComments',
    Header: () => <FormattedMessage {...messages.commentsColumnHeader} />,
    accessor: 'commentID',
    sortable: false,
    maxWidth: 110,
    Cell: props =>
      <ViewCommentsButton onClick={() => openComments(props.row.id)} />,
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

export default TaskReviewTable
