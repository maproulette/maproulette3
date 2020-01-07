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
import _isArray from 'lodash/isArray'
import _isFinite from 'lodash/isFinite'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _debounce from 'lodash/debounce'
import _each from 'lodash/each'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import _keys from 'lodash/keys'
import _concat from 'lodash/concat'
import parse from 'date-fns/parse'
import differenceInSeconds from 'date-fns/difference_in_seconds'
import { messagesByStatus,
         keysByStatus }
       from '../../services/Task/TaskStatus/TaskStatus'
import { messagesByReviewStatus,
         keysByReviewStatus }
      from '../../services/Task/TaskReview/TaskReviewStatus'
import { messagesByPriority }
       from '../../services/Task/TaskPriority/TaskPriority'
import { mapColors } from '../../interactions/User/AsEndUser'
import AsManager from '../../interactions/User/AsManager'
import WithLoadedTask from '../HOCs/WithLoadedTask/WithLoadedTask'
import WithConfigurableColumns from '../HOCs/WithConfigurableColumns/WithConfigurableColumns'
import ViewTask from '../ViewTask/ViewTask'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import TaskCommentsModal
       from '../../components/TaskCommentsModal/TaskCommentsModal'
import ConfigureColumnsModal
       from '../../components/ConfigureColumnsModal/ConfigureColumnsModal'
import messages from './Messages'
import 'react-table/react-table.css'
import './TaskAnalysisTable.scss'
import TaskAnalysisTableHeader from './TaskAnalysisTableHeader'

// Setup child components with necessary HOCs
const ViewTaskSubComponent = WithLoadedTask(ViewTask)

// columns
const ALL_COLUMNS = {featureId:{}, id:{}, status:{}, priority:{},
                 reviewStatus:{group:"review"}, reviewRequestedBy:{group:"review"},
                 reviewedBy:{group:"review"}, reviewedAt:{group:"review"},
                 reviewDuration:{group:"review"}, controls:{permanent: true},
                 comments:{}}

const DEFAULT_COLUMNS = ["featureId", "id", "status", "priority", "controls", "comments"]

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

    this.props.updateCriteria({sortCriteria, filters, page: tableState.page,
                            boundingBox: this.props.boundingBox})
  }

  configureColumns() {
    this.setState({showConfigureColumns: true})
  }

  getColumns = (manager, taskBaseRoute, data) => {
    const columnTypes = setupColumnTypes(this.props, taskBaseRoute, manager, data,
                                         taskId => this.setState({openComments: taskId}))

    if (_isArray(this.props.showColumns) && this.props.showColumns.length > 0) {
      return _compact(_map(this.props.showColumns, columnId => columnTypes[columnId]))
    }
    else {
      const findColumn = (column) => {
        if (column.startsWith(':')) {
          const key = column.slice(1)
          return {
            id: key,
            Header: key,
            Cell: ({row}) => {
              let valueToDisplay = ""
              if (_get(row._original.geometries, 'features.length', 0) > 0) {
                valueToDisplay = _get(row._original.geometries.features[0].properties, key)
              }
              return (
                !row._original ? null : <div className="">{valueToDisplay}</div>
              )
            }
          }
        }
        else {
          return columnTypes[column]
        }
      }
      return _concat([columnTypes.selected],
              _map(_keys(this.props.addedColumns), findColumn))
    }
  }

  render() {
    let taskBaseRoute = null

    // if management controls are to be shown, then a challenge object is required
    if (!_isArray(this.props.showColumns) ||
        this.props.showColumns.indexOf('controls') !== -1) {
      if (!_isObject(this.props.challenge) ||
          !_isObject(this.props.challenge.parent)) {
        return null
      }

      taskBaseRoute = `/admin/project/${this.props.challenge.parent.id}` +
                      `/challenge/${this.props.challenge.id}/task`
    }

    const pageSize = this.props.pageSize
    const page = this.props.page
    const totalPages = Math.ceil(_get(this.props, 'totalTaskCount', 0) / pageSize)

    let data = _get(this.props, 'taskData', [])
    let defaultSorted = [{id: 'name', desc: false}]
    let defaultFiltered = []

    if (_get(this.props, 'criteria.sortCriteria.sortBy')) {
      defaultSorted = [{id: this.props.criteria.sortCriteria.sortBy,
                        desc: this.props.criteria.sortCriteria.direction === "DESC"}]

      if (defaultSorted[0].id === "name") {
        data = _sortBy(data, (t) => (t.name || t.title))
      }
      else {
        data = _sortBy(data, defaultSorted[0].id)
      }
      if (defaultSorted[0].desc) {
        data = _reverse(data)
      }
    }
    if (_get(this.props, 'criteria.filters')) {
      defaultFiltered = _map(this.props.criteria.filters,
                             (value, key) => {return {id: key, value}})
    }

    const manager = AsManager(this.props.user)
    const columns = this.getColumns(manager, taskBaseRoute, data)

    return (
      <React.Fragment>
        <section className="mr-my-4">
          {!this.props.suppressHeader &&
           <header className="mr-mb-4">
             <TaskAnalysisTableHeader
               countShown={data.length}
               configureColumns={this.configureColumns.bind(this)}
               {...this.props}
             />
           </header>
          }
          <ReactTable
            data={data}
            columns={columns}
            SubComponent={props =>
              <ViewTaskSubComponent taskId={props.original.id} />
            }
            collapseOnDataChange={false}
            minRows={1}
            manual
            multiSort={false}
            defaultSorted={defaultSorted}
            defaultFiltered={defaultFiltered}
            defaultPageSize={this.props.defaultPageSize}
            pageSize={pageSize}
            pages={totalPages}
            onFetchData={(state, instance) => this.debouncedUpdateTasks(state, instance)}
            onPageSizeChange={(pageSize, pageIndex) => this.props.changePageSize(pageSize)}
            page={page}
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
        </section>
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

// Setup tasks table. See react-table docs for details
const setupColumnTypes = (props, taskBaseRoute, manager, data, openComments) => {
  const columns = {}

  columns.selected = {id: 'selected',
    Header: null,
    accessor: task => props.selectedTasks.has(task.id),
    Cell: ({value, original}) => (
      props.highlightPrimaryTask && original.id === props.task.id ?
      <span>✓</span> :
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

  columns.featureId = {
    id: 'name',
    Header: props.intl.formatMessage(messages.featureIdLabel),
    accessor: t => t.name || t.title,
    exportable: t => t.name || t.title,
  }

  columns.id = {
    id: 'id',
    Header: props.intl.formatMessage(messages.idLabel),
    accessor: t => {
      if (t.isBundlePrimary) {
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
      else if (_isFinite(t.bundleId)) {
        return (
          <span className="mr-flex mr-items-center">
            <SvgSymbol
              sym="puzzle-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-4 mr-h-4 mr-absolute mr-pin-l mr--ml-2"
              title={props.intl.formatMessage(messages.bundleMemberTooltip)}
            />
            {t.id}
          </span>
        )
      }
      else {
        return <span>{t.id}</span>
      }
    },
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
    Header: props.intl.formatMessage(messages.reviewRequestedByLabel),
    accessor: 'reviewRequestedBy',
    sortable: true,
    exportable: t => _get(t.reviewRequestedBy, 'username') || t.reviewRequestedBy,
    maxWidth: 180,
    Cell: ({row}) =>
      <div className={classNames("row-user-column",
                      mapColors(_get(row._original.reviewRequestedBy, 'username') || row._original.reviewRequestedBy))}>
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
    sortable: false,
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
        <div className={classNames("row-user-column",
                        mapColors(row._original.reviewedBy.username || row._original.reviewedBy))}>
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
    Header: props.intl.formatMessage(messages.controlsLabel),
    sortable: false,
    minWidth: 150,
    Cell: ({row}) =>
      <div className="row-controls-column">
        <Link to={`${taskBaseRoute}/${row._original.id}/inspect`} className="mr-mr-2">
          <FormattedMessage {...messages.inspectTaskLabel} />
        </Link>
        {manager.canWriteProject(props.challenge.parent) &&
         <Link to={`${taskBaseRoute}/${row._original.id}/edit`} className="mr-mr-2">
           <FormattedMessage {...messages.editTaskLabel} />
         </Link>
        }
        {(!_isUndefined(row._original.reviewStatus)) &&
         <Link to={`/challenge/${row._original.parent.id}/task/${row._original.id}/review`} className="mr-mr-2">
           <FormattedMessage {...messages.reviewTaskLabel} />
         </Link>
        }
        <Link to={`/challenge/${props.challenge.id}/task/${row._original.id}`}>
          <FormattedMessage {...messages.startTaskLabel} />
        </Link>
      </div>
  }

  columns.comments = {
    id: 'viewComments',
    Header: () => <FormattedMessage {...messages.commentsLabel} />,
    accessor: 'commentID',
    maxWidth: 110,
    sortable: false,
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

export default injectIntl(
  WithConfigurableColumns(
    TaskAnalysisTable,
    ALL_COLUMNS,
    DEFAULT_COLUMNS,
    messages
  )
)
