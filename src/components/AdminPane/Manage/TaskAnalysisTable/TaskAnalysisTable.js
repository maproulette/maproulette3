import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTable from 'react-table'
import classNames from 'classnames'
import { FormattedMessage, FormattedDate,
         FormattedTime, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _kebabCase from 'lodash/kebabCase'
import _isUndefined from 'lodash/isUndefined'
import _isFinite from 'lodash/isFinite'
import parse from 'date-fns/parse'
import differenceInSeconds from 'date-fns/difference_in_seconds'
import { messagesByStatus,
         keysByStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { messagesByReviewStatus,
         keysByReviewStatus }
      from '../../../../services/Task/TaskReview/TaskReviewStatus'
import { messagesByPriority }
       from '../../../../services/Task/TaskPriority/TaskPriority'
import AsManager from '../../../../interactions/User/AsManager'
import WithLoadedTask from '../../HOCs/WithLoadedTask/WithLoadedTask'
import ViewTask from '../ViewTask/ViewTask'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import TaskCommentsModal
       from '../../../../components/TaskCommentsModal/TaskCommentsModal'
import messages from './Messages'
import 'react-table/react-table.css'
import './TaskAnalysisTable.scss'
import TaskAnalysisTableHeader from './TaskAnalysisTableHeader'

// Setup child components with necessary HOCs
const ViewTaskSubComponent = WithLoadedTask(ViewTask)

/**
 * TaskAnalysisTable renders a table of tasks using react-table.  Rendering is
 * performed from summary info, like that given by clusteredTasks, but an
 * individual task can be expanded to see additional details provided by
 * the ViewTask component.
 *
 * @see See ViewTask
 * @see See [react-table](https://react-table.js.org)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class TaskAnalysisTable extends Component {
  state = {
    withReviewColumns: false,
    openComments: null,
  }

  toggleReviewColumns() {
    this.setState({withReviewColumns: !this.state.withReviewColumns})
  }

  getColumns = (manager, taskBaseRoute, data) => {
    const columnTypes = setupColumnTypes(this.props, taskBaseRoute, manager, data, taskId => this.setState({openComments: taskId}))

    if (this.state.withReviewColumns) {
       return [columnTypes.selected, columnTypes.featuredId, columnTypes.id,
               columnTypes.status, columnTypes.priority, columnTypes.mappedOn,
               columnTypes.reviewStatus, columnTypes.reviewRequestedBy,
               columnTypes.reviewedBy, columnTypes.reviewedAt, columnTypes.reviewDuration,
               columnTypes.controls, columnTypes.viewComments]
    }
    else {
      return [columnTypes.selected, columnTypes.featuredId, columnTypes.id,
              columnTypes.status, columnTypes.priority,
              columnTypes.controls, columnTypes.viewComments]
    }

  }

  render() {
    if (!_isObject(this.props.challenge) ||
        !_isObject(this.props.challenge.parent)) {
      return null
    }

    const manager = AsManager(this.props.user)

    const taskBaseRoute =
      `/admin/project/${this.props.challenge.parent.id}` +
      `/challenge/${this.props.challenge.id}/task`

    // Setup tasks table. See react-table docs for details.
    const data = _get(this.props, 'taskInfo.tasks', [])
    const columns = this.getColumns(manager, taskBaseRoute, data)

    return (
      <React.Fragment>
        <section className="mr-my-4">
          <header className="mr-mb-4">
            <TaskAnalysisTableHeader
              countShown={data.length}
              withReviewColumns={this.state.withReviewColumns}
              toggleReviewColumns={this.toggleReviewColumns.bind(this)}
              {...this.props}
            />
          </header>
          <ReactTable data={data} columns={columns}
                      SubComponent={props =>
                        <ViewTaskSubComponent taskId={props.original.id} />
                      }
                      collapseOnDataChange={false}
                      defaultSorted={[ {id: 'featureId', desc: false} ]}
          />
        </section>
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

const setupColumnTypes = (props, taskBaseRoute, manager, data, openComments) => {
  const columns = {}

  columns.selected = {id: 'selected',
    Header: null,
    accessor: task => props.selectedTasks.has(task.id),
    Cell: ({value, original}) => (
      <label className="checkbox">
        <input type="checkbox"
               checked={value}
               onChange={() => props.toggleTaskSelection(original)} />
      </label>
    ),
    maxWidth: 25,
    sortable: false,
    resizable: false,
    className: 'task-analysis-table__selection-option',
  }

  columns.featuredId = {
    id: 'featureId',
    Header: props.intl.formatMessage(messages.featureIdLabel),
    accessor: t => t.name || t.title,
    exportable: t => t.name || t.title,
  }

  columns.id = {
    id: 'id',
    Header: props.intl.formatMessage(messages.idLabel),
    accessor: 'id',
    exportable: t => t.id,
    maxWidth: 120,
  }

  columns.status = {
    id: 'status',
    Header: props.intl.formatMessage(messages.statusLabel),
    accessor: 'status',
    exportable: t => props.intl.formatMessage(messagesByStatus[t.status]),
    minWidth: 110,
    Cell: ({value}) => (
      <div>
        <StatusLabel
          {...props}
          intlMessage={messagesByStatus[value]}
          className={`mr-status-${_kebabCase(keysByStatus[value])}`}
        />
      </div>
    ),
  }

  columns.priority = {
    id: 'priority',
    Header: props.intl.formatMessage(messages.priorityLabel),
    accessor: 'priority',
    exportable: t => props.intl.formatMessage(messagesByPriority[t.priority]),
    maxWidth: 90,
    Cell: ({value}) => (
      <div>
        <FormattedMessage {...messagesByPriority[value]} />
      </div>
    ),
  }

  columns.mappedOn = {
    id: 'mappedOn',
    Header: props.intl.formatMessage(messages.mappedOnLabel),
    accessor: 'mappedOn',
    sortable: true,
    defaultSortDesc: false,
    exportable: t => t.mappedOn,
    maxWidth: 180,
    minWidth: 150,
    Cell: props => (
      !props.value ? null :
        <span>
          <FormattedDate value={props.value} /> <FormattedTime value={props.value} />
        </span>
    )
  }

  columns.reviewRequestedBy = {
    id: 'reviewRequestedBy',
    Header: props.intl.formatMessage(messages.mappedByLabel),
    accessor: 'reviewRequestedBy',
    sortable: true,
    exportable: t => _get(t.reviewRequestedBy, 'username') || t.reviewRequestedBy,
    maxWidth: 180,
    Cell: ({row}) =>
      <div className="row-user-column">
        {_get(row._original.reviewRequestedBy, 'username') || row._original.reviewRequestedBy }
      </div>
  }

  columns.reviewedAt = {
    id: 'reviewedAt',
    Header: props.intl.formatMessage(messages.reviewedAtLabel),
    accessor: 'reviewedAt',
    sortable: true,
    defaultSortDesc: true,
    exportable: t => t.reviewedAt,
    maxWidth: 180,
    minWidth: 150,
    Cell: props => (
      !props.value ? null :
        <span>
          <FormattedDate value={props.value} /> <FormattedTime value={props.value} />
        </span>

    )
  }

  columns.reviewDuration = {
    id: 'reviewDuration',
    Header: props.intl.formatMessage(messages.reviewDurationLabel),
    accessor: 'reviewStartedAt',
    sortable: true,
    defaultSortDesc: true,
    exportable: t => t.reviewStartedAt,
    maxWidth: 120,
    minWidth: 120,
    Cell: ({row}) => {
      if (!row._original.reviewedAt ||
          !row._original.reviewStartedAt) return null

      const seconds = differenceInSeconds(parse(row._original.reviewedAt),
                                          parse(row._original.reviewStartedAt))
      return (
        <span>
          {Math.floor(seconds / 60)}m {seconds % 60}s
        </span>
      )
    }
  }

  columns.reviewedBy = {
    id: 'reviewedBy',
    Header: props.intl.formatMessage(messages.reviewedByLabel),
    accessor: 'reviewedBy',
    sortable: true,
    exportable: t => _get(t.reviewedBy, 'username') || t.reviewedBy,
    maxWidth: 180,
    Cell: ({row}) => (
      !row._original.reviewedBy ? null :
        <div className="row-user-column">
          {row._original.reviewedBy.username || row._original.reviewedBy}
        </div>
    )
  }

  columns.reviewStatus = {
    id: 'reviewStatus',
    Header: props.intl.formatMessage(messages.reviewStatusLabel),
    accessor: x => _isUndefined(x.reviewStatus) ? -1 : x.reviewStatus,
    sortable: true,
    exportable: t => props.intl.formatMessage(messagesByReviewStatus[t.reviewStatus]),
    maxWidth: 180,
    minWidth: 155,
    defaultSortDesc: true,
    Cell: props => (
      (!_isUndefined(props.value) && props.value !== -1) ?
        <StatusLabel
          {...props}
          intlMessage={messagesByReviewStatus[props.value]}
          className={`mr-review-${_kebabCase(keysByReviewStatus[props.value])}`}
        />
        : null
    ),
  }

  columns.controls = {
    id: 'controls',
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    sortable: false,
    minWidth: 150,
    Cell: ({row}) =>
      <div className="row-controls-column">
        <Link to={`${taskBaseRoute}/${row.id}/inspect`} className="mr-mr-2">
          <FormattedMessage {...messages.inspectTaskLabel} />
        </Link>
        {manager.canWriteProject(props.challenge.parent) &&
         <Link to={`${taskBaseRoute}/${row.id}/edit`} className="mr-mr-2">
           <FormattedMessage {...messages.editTaskLabel} />
         </Link>
        }
        {(!_isUndefined(row._original.reviewStatus)) &&
         <Link to={`/challenge/${row._original.parent.id}/task/${row.id}/review`} className="mr-mr-2">
           <FormattedMessage {...messages.reviewTaskLabel} />
         </Link>
        }
        <Link to={`/challenge/${props.challenge.id}/task/${row.id}`}>
          <FormattedMessage {...messages.startTaskLabel} />
        </Link>
      </div>
  }

  columns.viewComments = {
    id: 'viewComments',
    Header: () => <FormattedMessage {...messages.commentsColumnLabel} />,
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

TaskAnalysisTable.propTypes = {
  /** The tasks to display */
  taskInfo: PropTypes.shape({
    challengeId: PropTypes.number,
    loading: PropTypes.bool,
    tasks: PropTypes.array,
  }),
  /** Challenge the tasks belong to */
  challenge: PropTypes.object,
  /** Total tasks available (we may receive a subset) */
  totalTaskCount: PropTypes.number,
  /** Map of currently selected tasks */
  selectedTasks: PropTypes.object.isRequired,
  /** Invoked to toggle selection of a task */
  toggleTaskSelection: PropTypes.func.isRequired,
}

export default injectIntl(TaskAnalysisTable)
