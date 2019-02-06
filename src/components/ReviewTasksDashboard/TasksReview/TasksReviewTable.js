import React, { Component } from 'react'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _each from 'lodash/map'
import { keysByStatus,
         messagesByStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'

import { TaskReviewStatus,
         keysByReviewStatus,
         messagesByReviewStatus }
      from '../../../services/Task/TaskReview/TaskReviewStatus'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'

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
  }

  componentDidUpdate(prevProps) {
  }

  updateTasks(state, instance) {
    this.setState({loading: true})

    const sortCriteria = {
      sortBy: state.sorted[0].id,
      direction: state.sorted[0].desc ? "DESC" : "ASC",
    }

    const filters = {}
    _each(state.filtered, (pair) => {filters[pair.id] = pair.value})

    this.props.updateReviewTasks({sortCriteria, filters, page: state.page},
                                  state.pageSize)
  }

  render() {
    // Setup tasks table. See react-table docs for details.
    const data = _get(this.props, 'reviewTasks', [])
    const countShown = data.length
    const columnTypes = setupColumnTypes(this.props, data)

    var header = <FormattedMessage {...messages.myReviewTasks} values={{countShown}} />
    var columns = [columnTypes.id, columnTypes.status, columnTypes.challenge,
                   columnTypes.modified, columnTypes.reviewedBy,
                   columnTypes.reviewStatus, columnTypes.mapperControls]


    if (this.props.asReviewer) {
      header = <FormattedMessage {...messages.tasksToBeReviewed} values={{countShown}} />
      columns = [columnTypes.id, columnTypes.status, columnTypes.reviewRequestedBy,
                 columnTypes.challenge, columnTypes.modified, columnTypes.reviewerControls]

      if (this.props.showReviewedByMe) {
        header = <FormattedMessage {...messages.tasksReviewedByMe} values={{countShown}} />
        columns = [columnTypes.id, columnTypes.status, columnTypes.reviewRequestedBy,
                   columnTypes.challenge, columnTypes.modified,
                   columnTypes.reviewStatus, columnTypes.reviewCompleteControls]
      }
    }

    // Setup wrapper that displays total tasks available, percentage
    // currently included in the table, CSV export option, etc.
    const taskCountWrapper = [{
      id: 'taskCount',
      Header: header,
      columns: columns,
    }]

    return (
      <div className='review__manage-review-tasks'>
        <div className="task-analysis-table">
          <ReactTable data={data} columns={taskCountWrapper}
                      defaultPageSize={this.props.defaultPageSize}
                      defaultSorted={[ {id: 'id', desc: false} ]}
                      minRows={this.props.defaultPageSize}
                      manual
                      multiSort={false}
                      pages={100}
                      onFetchData={(state, instance) => this.updateTasks(state, instance)}
          />
        </div>
      </div>
    )
  }
}

const setupColumnTypes = (props, data) => {
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
      exportable: t => props.intl.formatMessage(messagesByStatus[t.status]),
      Cell: ({value}) => (
        <div>
          <SvgSymbol sym='circle-icon'
                     viewBox='0 0 20 20'
                     className={classNames("status-icon",
                                           keysByStatus[value])} />
          <FormattedMessage {...messagesByStatus[value]} />
        </div>
      ),
    }

  columns.reviewRequestedBy = {
      id: 'reviewRequestedBy',
      Header: props.intl.formatMessage(messages.mappedByLabel),
      accessor: 'reviewRequestedBy',
      filterable: true,
      sortable: false,
      exportable: t => _get(t.reviewRequestedBy, 'username'),
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
      Cell: ({row}) =>{
        return <div className="row-challenge-column">
          <Link to={`/challenge/${row._original.parent.id}`}>
            {row._original.parent.name}
          </Link>
        </div>
      }
    }

  columns.modified = {
      id: 'modified',
      Header: props.intl.formatMessage(messages.modifiedLabel),
      accessor: 'modified',
      sortable: true,
      defaultSortDesc: true,
      exportable: t => t.modified,
    }

  columns.reviewedBy = {
      id: 'reviewedBy',
      Header: props.intl.formatMessage(messages.reviewedByLabel),
      accessor: 'reviewedBy',
      filterable: true,
      sortable: false,
      exportable: t => _get(t.reviewedBy, 'username'),
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
        Cell: ({value}) => (
          <div>
            <SvgSymbol sym='circle-icon'
                       viewBox='0 0 20 20'
                       className={classNames("status-icon",
                                             keysByReviewStatus[value])} />
            <FormattedMessage {...messagesByReviewStatus[value]} />
          </div>
        ),
      }

  columns.reviewerControls = {
      id: 'controls',
      Header: props.intl.formatMessage(messages.actionsColumnHeader),
      sortable: false,
      minWidth: 110,
      Cell: ({row}) =>{
        return <div className="row-controls-column">
          <Link to={`/challenge/${row._original.parent.id}/task/${row.id}/review`}>
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
      minWidth: 110,
      Cell: ({row}) =>{
        return <div className="row-controls-column">
          <Link to={`/challenge/${row._original.parent.id}/task/${row.id}/inspect`}>
            <FormattedMessage {...messages.viewTaskLabel} />
          </Link>
        </div>
      }
    }

  columns.mapperControls = {
      id: 'controls',
      Header: props.intl.formatMessage(messages.actionsColumnHeader),
      sortable: false,
      minWidth: 110,
      Cell: ({row}) =>{
        return <div className="row-controls-column">
          <Link to={`/challenge/${row._original.parent.id}/task/${row.id}/inspect`}>
            {row._original.reviewStatus === 2 ?
                <FormattedMessage {...messages.fixTaskLabel} /> :
                <FormattedMessage {...messages.viewTaskLabel} /> }
          </Link>
        </div>
      }
    }

  return columns
}

export default TaskReviewTable
