import React, { Component } from 'react'
import classNames from 'classnames'
import { FormattedMessage, FormattedDate, FormattedTime }
       from 'react-intl'
import _get from 'lodash/get'
import _each from 'lodash/map'
import _isFinite from 'lodash/isFinite'
import _kebabCase from 'lodash/kebabCase'
import _debounce from 'lodash/debounce'
import { TaskStatus, keysByStatus, messagesByStatus, isReviewableStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus, keysByReviewStatus, messagesByReviewStatus }
       from '../../../services/Task/TaskReview/TaskReviewStatus'
import TaskCommentsModal
       from '../../../components/TaskCommentsModal/TaskCommentsModal'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'
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
    tableState: {},
  }

  debouncedUpdateTasks = _debounce(this.updateTasks, 100)

  updateTasks(tableState, instance) {
    this.setState({loading: true, pageSize: tableState.pageSize})

    const sortCriteria = {
      sortBy: tableState.sorted[0].id,
      direction: tableState.sorted[0].desc ? "DESC" : "ASC",
    }

    const filters = {}
    _each(tableState.filtered, (pair) => {filters[pair.id] = pair.value})

    this.props.updateReviewTasks({sortCriteria, filters, page: tableState.page},
                                  tableState.pageSize).then(() => {
      this.setState({loading: false,
        tableState: {sortBy: sortCriteria.sortBy,
                     direction: sortCriteria.direction,
                     filters: filters}})
    })
  }

  render() {
    // Setup tasks table. See react-table docs for details.
    const data = _get(this.props, 'reviewTasks', [])
    const columnTypes = setupColumnTypes(this.props, taskId => this.setState({openComments: taskId}), data, this.state.tableState)
    const pageSize = this.state.pageSize || this.props.defaultPageSize
    const totalPages = Math.ceil(_get(this.props, 'totalCount', 0) / pageSize)

    var subheader = <FormattedMessage {...messages.myReviewTasks} />
    var columns = [columnTypes.id, columnTypes.reviewStatus, columnTypes.challenge,
                   columnTypes.mappedOn, columnTypes.reviewedBy, columnTypes.status,
                   columnTypes.mapperControls, columnTypes.viewComments]

    if (this.props.asReviewer) {
      subheader = <FormattedMessage {...messages.tasksToBeReviewed} />
      columns = [columnTypes.id, columnTypes.reviewRequestedBy,
                 columnTypes.challenge, columnTypes.mappedOn, columnTypes.status,
                 columnTypes.reviewerControls, columnTypes.viewComments]

      if (this.props.showReviewedByMe) {
        subheader = <FormattedMessage {...messages.tasksReviewedByMe} />
        columns = [columnTypes.id, columnTypes.reviewStatus, columnTypes.reviewRequestedBy,
                   columnTypes.challenge, columnTypes.mappedOn, columnTypes.status,
                   columnTypes.reviewCompleteControls, columnTypes.viewComments]
      }
    }

    return (
      <React.Fragment>
        <div className="mr-flex-grow mr-w-full mr-mx-auto mr-bg-white mr-text-black mr-rounded mr-p-6 md:mr-p-8 mr-mb-12">
          <header className="sm:mr-flex sm:mr-items-end sm:mr-justify-between mr-mb-6">
            <div>
              <h1 className="mr-h2 mr-text-blue-light mr-mb-2 md:mr-mr-4">
                {subheader}
              </h1>
            </div>
          </header>
          <ReactTable data={data} columns={columns}
                      defaultPageSize={this.props.defaultPageSize}
                      defaultSorted={[ {id: 'mappedOn', desc: false} ]}
                      minRows={1}
                      manual
                      multiSort={false}
                      noDataText={<FormattedMessage {...messages.noTasks} />}
                      pages={totalPages}
                      onFetchData={(state, instance) => this.debouncedUpdateTasks(state, instance)}
                      loading={this.state.loading}
          />
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

const setupColumnTypes = (props, openComments, data, tableState) => {
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
    Cell: ({row}) => (
      <div className="row-challenge-column">
        <Link
          to={`/challenge/${row._original.parent.id}`}
          title={row._original.parent.name}
        >
          {row._original.parent.name}
        </Link>
      </div>
    )
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
    exportable: t => props.intl.formatMessage(messagesByReviewStatus[t.reviewStatus]),
    maxWidth: 180,
    Cell: props => (
      <StatusLabel
        {...props}
        intlMessage={messagesByReviewStatus[props.value]}
        className={`mr-review-${_kebabCase(keysByReviewStatus[props.value])}`}
      />
    ),
  }

  columns.reviewerControls = {
    id: 'controls',
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    sortable: false,
    maxWidth: 120,
    Cell: ({row}) =>{
      var linkTo =`/challenge/${row._original.parent.id}/task/${row.id}/review?`
      if (tableState.sortBy) {
        linkTo += `sortBy=${tableState.sortBy}&direction=${tableState.direction}&`
      }

      if (tableState.filters) {
        linkTo += `filters=${encodeURIComponent(JSON.stringify(tableState.filters))}`
      }

      return <div className="row-controls-column">
        <Link to={linkTo}>
          <FormattedMessage {...messages.reviewTaskLabel} />
          { row._original.reviewedBy && row._original.reviewStatus === TaskReviewStatus.needed && " (again)" }
        </Link>
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
