import React, { Component } from 'react'
import classNames from 'classnames'
import { FormattedMessage, FormattedDate, FormattedTime }
       from 'react-intl'
import _get from 'lodash/get'
import _each from 'lodash/map'
import _isFinite from 'lodash/isFinite'
import _kebabCase from 'lodash/kebabCase'
import { keysByStatus,
         messagesByStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'

import { TaskReviewStatus,
         keysByReviewStatus,
         messagesByReviewStatus }
      from '../../../services/Task/TaskReview/TaskReviewStatus'
import TaskCommentsModal from '../../TaskCommentsModal/TaskCommentsModal'
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
    openComments: null,
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
    const columnTypes = setupColumnTypes(this.props, taskId => this.setState({openComments: taskId}), data)

    var subheader = <FormattedMessage {...messages.myReviewTasks} />
    var columns = [columnTypes.id, columnTypes.status, columnTypes.challenge,
                   columnTypes.modified, columnTypes.reviewedBy,
                   columnTypes.reviewStatus, columnTypes.mapperControls,
                   columnTypes.viewComments]

    if (this.props.asReviewer) {
      subheader = <FormattedMessage {...messages.tasksToBeReviewed} />
      columns = [columnTypes.id, columnTypes.status, columnTypes.reviewRequestedBy,
                 columnTypes.challenge, columnTypes.modified, columnTypes.reviewerControls,
                 columnTypes.viewComments]

      if (this.props.showReviewedByMe) {
        subheader = <FormattedMessage {...messages.tasksReviewedByMe} />
        columns = [columnTypes.id, columnTypes.status, columnTypes.reviewRequestedBy,
                   columnTypes.challenge, columnTypes.modified,
                   columnTypes.reviewStatus, columnTypes.reviewCompleteControls,
                   columnTypes.viewComments]
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
                      defaultSorted={[ {id: 'id', desc: false} ]}
                      minRows={this.props.defaultPageSize}
                      manual
                      multiSort={false}
                      pages={100}
                      onFetchData={(state, instance) => this.updateTasks(state, instance)}
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

const setupColumnTypes = (props, openComments, data) => {
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
    maxWidth: 140,
    Cell: props => (
      <StatusLabel
        {...props}
        intlMessage={messagesByStatus[props.value]}
        className={`mr-status-${_kebabCase(keysByStatus[props.value])}`}
      />
    ),
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
    maxWidth: 500,
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

  columns.modified = {
    id: 'modified',
    Header: props.intl.formatMessage(messages.modifiedLabel),
    accessor: 'modified',
    sortable: true,
    defaultSortDesc: true,
    exportable: t => t.modified,
    maxWidth: 180,
    Cell: props => (
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
    minWidth: 90,
    maxWidth: 120,
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

  columns.viewComments = {
    id: 'viewComments',
    Header: () => <FormattedMessage {...messages.commentsColumnHeader} />,
    accessor: 'commentID',
    maxWidth: 120,
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
