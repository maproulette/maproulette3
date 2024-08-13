import { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import ReactTable from 'react-table-6'
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
import _filter from 'lodash/filter'
import _split from 'lodash/split'
import _isEmpty from 'lodash/isEmpty'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import { parseISO,differenceInSeconds } from 'date-fns'
import { messagesByStatus,
         keysByStatus }
       from '../../services/Task/TaskStatus/TaskStatus'
import { messagesByReviewStatus,
         keysByReviewStatus }
      from '../../services/Task/TaskReview/TaskReviewStatus'
import { messagesByPriority }
       from '../../services/Task/TaskPriority/TaskPriority'
import AsManager from '../../interactions/User/AsManager'
import AsColoredHashable from '../../interactions/Hashable/AsColoredHashable'
import WithLoadedTask from '../HOCs/WithLoadedTask/WithLoadedTask'
import WithConfigurableColumns from '../HOCs/WithConfigurableColumns/WithConfigurableColumns'
import { intlTableProps } from '../../components/IntlTable/IntlTable'
import ViewTask from '../ViewTask/ViewTask'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import TaskCommentsModal
       from '../../components/TaskCommentsModal/TaskCommentsModal'
import ConfigureColumnsModal
       from '../../components/ConfigureColumnsModal/ConfigureColumnsModal'
import InTableTagFilter
      from '../../components/KeywordAutosuggestInput/InTableTagFilter'
import messages from './Messages'
import './TaskAnalysisTable.scss'
import TaskAnalysisTableHeader from './TaskAnalysisTableHeader'
import AsCooperativeWork from '../../interactions/Task/AsCooperativeWork'
import { ViewCommentsButton, StatusLabel, makeInvertable }
  from './TaskTableHelpers'

// Setup child components with necessary HOCs
const ViewTaskSubComponent = WithLoadedTask(ViewTask)

// columns
const ALL_COLUMNS =
  Object.assign({featureId:{}, id:{}, status:{}, priority:{},
    completedDuration:{}, mappedOn:{}, editBundle: {},
    reviewStatus:{group:"review"},
    reviewRequestedBy:{group:"review"},
    reviewedBy:{group:"review"}, reviewedAt:{group:"review"},
    reviewDuration:{group:"review"}, controls:{permanent: true},
    comments:{}, tags:{}, additionalReviewers:{group:"review"}},
    process.env.REACT_APP_FEATURE_META_QC === 'enabled' ?
      {metaReviewStatus:{group:"review"}, metaReviewedBy:{group:"review"},
       metaReviewedAt:{group:"review"}} : null
  )

const DEFAULT_COLUMNS = ["featureId", "id", "status", "priority", "controls", "comments", "editBundle"]

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
export class TaskAnalysisTableInternal extends Component {
  state = {
    openComments: null,
    showConfigureColumns: false,
  }

  debouncedUpdateTasks = _debounce(this.updateTasks, 100)

  updateTasks(tableState) {
    const sortCriteria = {
      sortBy: tableState.sorted[0].id,
      direction: tableState.sorted[0].desc ? "DESC" : "ASC",
    }

    const filters = {}
    _each(tableState.filtered, (pair) => {filters[pair.id] = pair.value})

    this.props.updateCriteria({sortCriteria, filters, page: tableState.page,
      boundingBox: this.props.boundingBox,
      includeTags: !!_get(this.props.addedColumns, 'tags')})

    // Use pick instead of cloneDeep, as cloning the entire tableState seems to cause an error
    // when any column with a "makeInvertable" header is present.
    this.setState({lastTableState: _pick(tableState, ["sorted", "filtered", "page"])})
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
            },
            sortable: false,
          }
        }
        else {
          return columnTypes[column]
        }
      }
      return _concat([columnTypes.selected],
              _filter(_map(_keys(this.props.addedColumns), findColumn),
                      c => !_isUndefined(c)))
    }
  }

  componentDidUpdate(prevProps) {
    // If we've added the "tag" column, we need to update the table to fetch
    // the tag data.
    if (!_get(prevProps.addedColumns, 'tags') &&
        _get(this.props.addedColumns, 'tags') &&
        this.state.lastTableState) {
      this.updateTasks(this.state.lastTableState)
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
      else if (defaultSorted[0].id === "reviewDuration") {
        data = _sortBy(data, (t) => {
          if (!t.reviewedAt || !t.reviewStartedAt) {
            return 0
          }
          return differenceInSeconds(parseISO(t.reviewedAt), parseISO(t.reviewStartedAt))
        })
      }
      else {
        data = _sortBy(data, defaultSorted[0].id)
      }
      if (defaultSorted[0].desc) {
        data = _reverse(data)
      }
    }

    if (_get(this.props, 'criteria.filters')) {
      defaultFiltered = _map(
        this.props.criteria.filters,
        (value, key) => ({id: key, value})
      )
    }

    const manager = AsManager(this.props.user)
    const columns = this.getColumns(manager, taskBaseRoute, data)

    return (
      <Fragment>
        <section className="mr-my-4 mr-min-h-100 mr-fixed-containing-block">
          {!this.props.suppressHeader &&
           <header className="mr-mb-4">
             <TaskAnalysisTableHeader
               {...this.props}
               countShown={data.length}
               configureColumns={this.configureColumns.bind(this)}
             />
           </header>
          }
          <ReactTable
            data={data}
            columns={columns}
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
                  {filterValue && <button className="mr-text-white hover:mr-text-green-lighter mr-transition-colors" onClick={clearFilter}>
                    <SvgSymbol sym="icon-close" viewBox="0 0 20 20" className="mr-fill-current mr-w-2.5 mr-h-2.5"/>
                  </button>}
                </div>
                )
              }
            }
            SubComponent={props =>
              <ViewTaskSubComponent taskId={props.original.id} />
            }
            unbundleTask={this.props.unbundleTask}
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
            onPageSizeChange={(pageSize) => this.props.changePageSize(pageSize)}
            page={page}
            getTheadFilterThProps={() => {
              return {style: {position: "inherit", overflow: "inherit"}}}
            }
            onFilteredChange={filtered => {
              this.setState({ filtered })
              if (this.fetchData) {
                this.fetchData()
              }
            }}
            loading={this.props.loadingTasks}
            {...intlTableProps(this.props.intl)}
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
      </Fragment>
    );
  }
}

// Setup tasks table. See react-table docs for details
const setupColumnTypes = (props, taskBaseRoute, manager, data, openComments) => {
  const columns = {}

  columns.selected = {
    id: 'selected',
    Header: null,
    accessor: task => props.isTaskSelected(task.id),
    Cell: ({ value, original }) => {
      const status = original.status ?? original.taskStatus
      const alreadyBundled = original.bundleId && !props.taskBundle?.bundleId !== original.bundleId
      const enableSelecting =
      !alreadyBundled &&
      !props.bundling &&
      !props.taskReadOnly &&
      [0, 3, 6].includes(status) &&
      original.taskId !== props.task?.id &&
      props.workspace.name !== 'taskReview' &&
      !AsCooperativeWork(props.task).isTagType()
    

      return (
        props.highlightPrimaryTask && original.id === props.task?.id && !original.bundleId ?
          <span className="mr-text-green-lighter">✓</span> :
          enableSelecting ?
            <input
              type="checkbox"
              className="mr-checkbox-toggle"
              checked={value}
              onChange={() => props.toggleTaskSelection(original)}
            /> : ''
      )
    },
    maxWidth: 25,
    sortable: false,
    resizable: false,
    className: 'task-analysis-table__selection-option',
  }

  columns.featureId = {
    id: 'featureId',
    Header: props.intl.formatMessage(messages.featureIdLabel),
    accessor: t => t.name || t.title,
    exportable: t => t.name || t.title,
    sortable: false,
    filterable: true,
  }

  columns.id = {
    id: 'id',
    Header: props.intl.formatMessage(messages.idLabel),
    accessor: t => {
      const taskLink = (
        <div className="row-controls-column mr-links-green-lighter">
          <Link 
            to={`/challenge/${t.parentId}/task/${t.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.id}
          </Link>
        </div>
      )
      
      if (t.isBundlePrimary && t.id === props.task?.id) {
        return (
          <span className="mr-flex mr-items-center">
            <SvgSymbol
              sym="box-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-3 mr-h-3 mr-absolute mr-left-0 mr--ml-2"
              title={props.intl.formatMessage(messages.multipleTasksTooltip)}
            />
            {taskLink}
          </span>
        )
      }
      else if (_isFinite(t.bundleId) && t.bundleId && t.bundleId == props.taskBundle?.bundleId) {
        return (
          <span className="mr-flex mr-items-center">
            <SvgSymbol
              sym="puzzle-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-4 mr-h-4 mr-absolute mr-left-0 mr--ml-2"
              title={props.intl.formatMessage(messages.bundleMemberTooltip)}
            />
            {taskLink}
          </span>
        )
      }
      else {
        return <span>{taskLink}</span>
      }
    },
    exportable: t => t.id,
    filterable: true,
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

  columns.editBundle = {
    id: 'editBundle',
    Header: null,
    sortable: false,
    accessor: 'remove',
    minWidth: 110,
    Cell: ({ row }) => {
      const bundlePrimary = props.taskBundle?.tasks.find(task => task.isBundlePrimary)
      const isTaskSelected = row._original.id === (bundlePrimary?.id || props.task?.id)
      const alreadyBundled = row._original.bundleId && props.taskBundle?.bundleId !== row._original.bundleId
      const enableBundleEdits = props.initialBundle?.taskIds?.includes(row._original.id) ||
                                [0, 3, 6].includes(row._original.status)

      return (
        <div>
          {!isTaskSelected && enableBundleEdits && !alreadyBundled && (
            <button
              disabled={props.bundleEditsDisabled}
              className="mr-text-red-light"
              style={{
                cursor: props.bundleEditsDisabled ? 'default' : 'pointer',
                opacity: props.bundleEditsDisabled ? 0.3 : 1,
                pointerEvents: props.bundleEditsDisabled ? 'none' : 'auto'
              }}
              onClick={() => props.unbundleTask(row._original)}
            >
              <FormattedMessage {...messages.unbundle} />
            </button>
          )}
  
          {isTaskSelected && <div className="mr-text-yellow">Primary Task</div>}
        </div>
      );
    },
  };

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

  columns.completedDuration = {
    id: 'completedTimeSpent',
    Header: props.intl.formatMessage(messages.completedDurationLabel),
    accessor: 'completedTimeSpent',
    sortable: true,
    defaultSortDesc: true,
    exportable: t => t.completedTimeSpent,
    maxWidth: 120,
    minWidth: 120,
    Cell: ({row}) => {
      if (!row._original.completedTimeSpent) return null

      const seconds = row._original.completedTimeSpent / 1000
      return (
        <span>
          {Math.floor(seconds / 60)}m {Math.floor(seconds) % 60}s
        </span>
      )
    }
  }

  columns.reviewRequestedBy = {
    id: 'completedBy',
    Header: makeInvertable(props.intl.formatMessage(messages.reviewRequestedByLabel),
                           () => props.invertField('completedBy'),
                           _get(props.criteria, 'invertFields.completedBy')),

    accessor: 'completedBy',
    sortable: true,
    filterable: true,
    exportable: t => _get(t.completedBy, 'username') || t.completedBy,
    maxWidth: 180,
    Cell: ({row}) => (
      <div
        className="row-user-column"
        style={{color: AsColoredHashable(_get(row._original.completedBy, 'username') || row._original.completedBy).hashColor}}
      >
        {_get(row._original.completedBy, 'username') || row._original.completedBy}
      </div>
    ),
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

  columns.metaReviewedAt = {
    id: 'metaReviewedAt',
    Header: props.intl.formatMessage(messages.metaReviewedAtLabel),
    accessor: 'metaReviewedAt',
    sortable: true,
    defaultSortDesc: true,
    exportable: t => t.metaReviewedAt,
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
    accessor: 'reviewDuration',
    sortable: true,
    defaultSortDesc: true,
    maxWidth: 120,
    minWidth: 120,
    Cell: ({row}) => {
      if (!row._original.reviewedAt ||
          !row._original.reviewStartedAt) return null

      const seconds = differenceInSeconds(parseISO(row._original.reviewedAt),
                                          parseISO(row._original.reviewStartedAt))
      return (
        <span>
          {Math.floor(seconds / 60)}m {seconds % 60}s
        </span>
      )
    }
  }

  columns.reviewedBy = {
    id: 'reviewedBy',
    Header: makeInvertable(props.intl.formatMessage(messages.reviewedByLabel),
                           () => props.invertField('reviewedBy'),
                           _get(props.criteria, 'invertFields.reviewedBy')),
    accessor: 'reviewedBy',
    filterable: true,
    sortable: true,
    exportable: t => _get(t.reviewedBy, 'username') || t.reviewedBy,
    maxWidth: 180,
    Cell: ({row}) => (
      !row._original.reviewedBy ?
      null :
      <div
        className="row-user-column"
        style={{color: AsColoredHashable(row._original.reviewedBy.username || row._original.reviewedBy).hashColor}}
      >
        {row._original.reviewedBy.username || row._original.reviewedBy}
      </div>
    ),
  }

  columns.metaReviewedBy = {
    id: 'metaReviewedBy',
    Header: makeInvertable(props.intl.formatMessage(messages.metaReviewedByLabel),
                           () => props.invertField('metaReviewedBy'),
                           _get(props.criteria, 'invertFields.metaReviewedBy')),
    accessor: 'metaReviewedBy',
    filterable: true,
    sortable: true,
    exportable: t => _get(t.metaReviewedBy, 'username') || t.metaReviewedBy,
    maxWidth: 180,
    Cell: ({row}) => (
      !row._original.metaReviewedBy ?
      null :
      <div
        className="row-user-column"
        style={{color: AsColoredHashable(row._original.metaReviewedBy.username || row._original.metaReviewedBy).hashColor}}
      >
        {row._original.metaReviewedBy.username || row._original.metaReviewedBy}
      </div>
    ),
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

  columns.metaReviewStatus = {
    id: 'metaReviewStatus',
    Header: props.intl.formatMessage(messages.metaReviewStatusLabel),
    accessor: x => _isUndefined(x.metaReviewStatus) ? -1 : x.metaReviewStatus,
    sortable: true,
    exportable: t => props.intl.formatMessage(messagesByReviewStatus[t.metaReviewStatus]),
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
            <Fragment key={reviewer.username + "-" + index}>
              <span style={{color: AsColoredHashable(reviewer.username).hashColor}}>{reviewer.username}</span>
              {(index + 1) !== _get(row._original.additionalReviewers, 'length') ? ", " : ""}
            </Fragment>
          );
        })}
      </div>
    ),
  }

  columns.controls = {
    id: 'controls',
    Header: props.intl.formatMessage(messages.controlsLabel),
    sortable: false,
    minWidth: 150,
    Cell: ({row}) =>
      <div className="row-controls-column mr-links-green-lighter">
        <Link className="mr-mr-2" to={{
          pathname: `${taskBaseRoute}/${row._original.id}/inspect`,
          state: props.criteria
        }}>
          <FormattedMessage {...messages.inspectTaskLabel} />
        </Link>
        {manager.canWriteProject(props.challenge.parent) &&
         <Link className="mr-mr-2" to={{
           pathname: `${taskBaseRoute}/${row._original.id}/edit`,
           state: props.criteria
         }}>
           <FormattedMessage {...messages.editTaskLabel} />
         </Link>
        }
        {(!_isUndefined(row._original.reviewStatus)) &&
         <Link
           to={{
                  pathname: `/challenge/${props.challenge.id}/task/` +
                            `${row._original.id}/review`,
                  state: _merge({filters:{challengeId: props.challenge.id}},
                                props.criteria)
                }}
           className="mr-mr-2" >
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
      const preferredTags =
        _filter(_split(_get(props, 'challenge.preferredTags'), ',').concat(
                _split(_get(props, 'challenge.preferredReviewTags'), ',')),
                (result) => !_isEmpty(result))

      return (
        <InTableTagFilter
          {...props}
          preferredTags={preferredTags}
          onChange={onChange}
          value={_get(filter, 'value') ?? ""}
        />
      )
    }
  }

  return columns
}

TaskAnalysisTableInternal.propTypes = {
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
  /** Currently selected tasks */
  selectedTasks: PropTypes.object.isRequired,
  /** Invoked to toggle selection of a task */
  toggleTaskSelection: PropTypes.func.isRequired,
}

export default injectIntl(
  WithConfigurableColumns(
    TaskAnalysisTableInternal,
    ALL_COLUMNS,
    DEFAULT_COLUMNS,
    messages
  )
)
