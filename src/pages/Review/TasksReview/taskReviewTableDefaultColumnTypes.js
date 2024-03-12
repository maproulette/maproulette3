import React from 'react'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'
import { StatusLabel } from '../../../components/TaskAnalysisTable/TaskTableHelpers'
import TaskFilterMultiSelectDropdown from './TaskFilterMultiSelectDropdown'
import FilterSuggestTextBox from './FilterSuggestTextBox'
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl'
import { Link } from 'react-router-dom'
import IntlDatePicker from '../../../components/IntlDatePicker/IntlDatePicker'
import InTableTagFilter from '../../../components/KeywordAutosuggestInput/InTableTagFilter'
import messages from './Messages'
import parse from 'date-fns/parse'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _kebabCase from 'lodash/kebabCase'
import _isUndefined from 'lodash/isUndefined'
import { TaskStatus, keysByStatus, messagesByStatus, isReviewableStatus }
      from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskPriority, keysByPriority, messagesByPriority }
      from '../../../services/Task/TaskPriority/TaskPriority'
import { TaskReviewStatus, keysByReviewStatus, messagesByReviewStatus,
         messagesByMetaReviewStatus, isNeedsReviewStatus, isMetaReviewStatus, TaskMetaReviewStatusWithUnset }
      from '../../../services/Task/TaskReview/TaskReviewStatus'
import { ReviewTasksType } from '../../../services/Task/TaskReview/TaskReview'
import { getInitialTaskStatusFiltersByContext } from '../taskStatusFiltersByReviewType'
import AsColoredHashable from '../../../interactions/Hashable/AsColoredHashable'
import { ViewCommentsButton, makeInvertable }
  from '../../../components/TaskAnalysisTable/TaskTableHelpers'

// Column setup to be used with the TasksReviewTable react-table implementation to render default columns.
// Formatted to return a "columns" object to allow column management and custom columns in the table component.

export const setupColumnTypes = (props, openComments, data, criteria) => {
  const initialTaskStatusFilters = getInitialTaskStatusFiltersByContext(props.reviewTasksType)
  const handleClick = (e, linkTo) => {
    e.preventDefault()
    props.history.push({
      pathname: linkTo,
      criteria,
    })
  }
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

  columns.featureId = {
    id: 'featureId',
    Header: props.intl.formatMessage(messages.featureIdLabel),
    accessor: t => {
        return <span>{t.geometries.features ? t.geometries.features[0].id : "N/A"}</span>
    },
    exportable: t => t.geometries.features ? t.geometries.features[0].id : "N/A",
    sortable: false,
    filterable: false,
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
    Filter: ({ onChange }) => {
      const items = []
      _each(TaskStatus, status => {
        if(isReviewableStatus(status)) {
          items.push({
            label: props.intl.formatMessage(messagesByStatus[status]),
            value: status
          })
        }
      })

      return (
      <div className='mr-space-x-1 mr-flex'>
        <div className='mr-w-full mr-flex-shrink-0'>
          <TaskFilterMultiSelectDropdown 
            itemList={items}
            filterState={props.taskStatusFilterIds}
            onChange={item => {
              onChange(item)
              setTimeout(() => props.updateTaskStatusFiltersByCategory(item, "taskStatusFilterIds"), 0)
            }}   
          />
        </div>
        {props.taskStatusFilterIds.length < initialTaskStatusFilters.status.length && (
          <button 
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={() => {
                onChange(initialTaskStatusFilters.status.join(','))
                setTimeout(() => props.clearTaskStatusFiltersByCategory("status", "taskStatusFilterIds"), 0)
              }}
            >
              <SvgSymbol sym="icon-close" viewBox="0 0 20 20" className="mr-fill-current mr-w-2.5 mr-h-2.5"/>
          </button> 
        )}
      </div>
      )
    },
  }

  columns.priority = {
    id: 'priority',
    Header: makeInvertable(props.intl.formatMessage(messages.prioritiesLabel),
                           () => props.invertField('priorities'),
                           _get(criteria, 'invertFields.priorities')),
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
    
    Filter: ({ onChange }) => {
      const items = []

      _each(TaskPriority, priority => {
        items.push({
          label: props.intl.formatMessage(messagesByPriority[priority]),
          value: priority
        })
      })

      return (
        <div className='mr-space-x-1 mr-flex'>
          <div className='mr-w-full mr-flex-shrink-0'>
            <TaskFilterMultiSelectDropdown 
              itemList={items}
              filterState={props.taskPriorityFilterIds}
              onChange={item => {
                onChange(null)
                setTimeout(() => props.updateTaskStatusFiltersByCategory(item, "taskPriorityFilterIds"), 0)
              }}   
            />
          </div>
          {props.taskPriorityFilterIds.length < initialTaskStatusFilters.priorities.length && (
            <button 
                className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
                onClick={() => {
                  onChange(null)
                  setTimeout(() => props.clearTaskStatusFiltersByCategory("priorities", "taskPriorityFilterIds"), 0)
                }}
              >
                <SvgSymbol sym="icon-close" viewBox="0 0 20 20" className="mr-fill-current mr-w-2.5 mr-h-2.5"/>
            </button>
          )}
        </div>
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

  columns.challengeId = {
    id: 'challengeId',
    Header: props.intl.formatMessage(messages.challengeIdLabel),
    accessor: t => {
        return <span>{t.parent.id}</span>
    },
    exportable: t => t.id,
    sortable: false,
    filterable: false,
    maxWidth: 120,
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
        <div className='mr-space-x-1'>
          <div className='mr-inline-block'>
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
          </div>
          {props.challengeFilterIds && props.challengeFilterIds.length && props.challengeFilterIds?.[0] !== -2 ? (
            <button 
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={() => {
                onChange({ id: -2, name: "All Challenges" })
                setTimeout(() => props.updateChallengeFilterIds({ id: -2, name: "All Challenges" }), 0)
              }}
            >
              <SvgSymbol sym="icon-close" viewBox="0 0 20 20" className="mr-fill-current mr-w-2.5 mr-h-2.5"/>
            </button>
          ) : null}
        </div>
      )
    }
  }

  columns.projectId = {
    id: 'projectId',
    Header: props.intl.formatMessage(messages.projectIdLabel),
    accessor: t => {
      return <span>{t.parent.parent.id}</span>
  },
  exportable: t => t.parent.parent.id,
  sortable: false,
  filterable: false,
  maxWidth: 120,
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
        <div className='mr-space-x-1'>
          <div className='mr-inline-block'>
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
          </div>
            {props.projectFilterIds && props.projectFilterIds.length && props.projectFilterIds?.[0] !== -2 ? (
              <button 
                className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
                onClick={() => {
                  onChange({ id: -2, name: "All Projects" })
                  setTimeout(() => props.updateProjectFilterIds({ id: -2, name: "All Projects" }), 0)
                }}
              >
                <SvgSymbol sym="icon-close" viewBox="0 0 20 20" className="mr-fill-current mr-w-2.5 mr-h-2.5"/>
              </button>
            ) : null}
        </div>
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

      const clearFilter = () => props.setFiltered("mappedOn", null)
      
      return (
        <div className='mr-space-x-1'>
          <IntlDatePicker
              selected={mappedOn}
              onChange={(value) => {
                props.setFiltered("mappedOn", value)
              }}
              intl={props.intl}
          />
          {mappedOn && (
            <button className="mr-text-white hover:mr-text-green-lighter mr-transition-colors" onClick={clearFilter}>
              <SvgSymbol sym="icon-close" viewBox="0 0 20 20" className="mr-fill-current mr-w-2.5 mr-h-2.5"/>
            </button>
          )}
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

      const clearFilter = () => props.setFiltered("reviewedAt", null)

      return (
        <div className='mr-space-x-1'>
          <IntlDatePicker
              selected={reviewedAt}
              onChange={(value) => {
                props.setFiltered("reviewedAt", value)
              }}
              intl={props.intl}
          />
          {reviewedAt && (
            <button className="mr-text-white hover:mr-text-green-lighter mr-transition-colors" onClick={clearFilter}>
              <SvgSymbol sym="icon-close" viewBox="0 0 20 20" className="mr-fill-current mr-w-2.5 mr-h-2.5"/>
            </button>
          )}
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
    Filter: ({ onChange }) => {
      const items = []
      if(props.reviewTasksType === ReviewTasksType.metaReviewTasks) {
        _each([TaskReviewStatus.approved, TaskReviewStatus.approvedWithFixes], status => {
          items.push({
            label: props.intl.formatMessage(messagesByReviewStatus[status]),
            value: status
          })
        })
      } else if(props.reviewTasksType === ReviewTasksType.reviewedByMe ||
          props.reviewTasksType === ReviewTasksType.myReviewedTasks ||
          props.reviewTasksType === ReviewTasksType.allReviewedTasks) {
        _each(TaskReviewStatus, (status) => {
          if (status !== TaskReviewStatus.unnecessary) {
            items.push({
              label: props.intl.formatMessage(messagesByReviewStatus[status]),
              value: status
            })
          }
        })
      } else {
        _each(TaskReviewStatus, (status) => {
          if (isNeedsReviewStatus(status)) {
            items.push({
              label: props.intl.formatMessage(messagesByReviewStatus[status]),
              value: status
            })
          }
        })
      }

      return (
        <div className='mr-space-x-1 mr-flex'>
          <div className='mr-w-full mr-flex-shrink-0'>
            <TaskFilterMultiSelectDropdown 
              itemList={items}
              filterState={props.taskReviewStatusFilterIds}
              onChange={item => {
                onChange(item)
                setTimeout(() => props.updateTaskStatusFiltersByCategory(item, "taskReviewStatusFilterIds"), 0)
              }}   
            />
          </div>
          {props.taskReviewStatusFilterIds.length < initialTaskStatusFilters.reviewStatus.length && (
            <button 
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={() => {
                onChange(initialTaskStatusFilters.reviewStatus.join(','))
                setTimeout(() => props.clearTaskStatusFiltersByCategory("reviewStatus", "taskReviewStatusFilterIds"), 0)
              }}
            >
              <SvgSymbol sym="icon-close" viewBox="0 0 20 20" className="mr-fill-current mr-w-2.5 mr-h-2.5"/>
            </button>
          )}
        </div>
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
    Filter: ({ onChange }) => {
      const items = []

      if(props.reviewTasksType === ReviewTasksType.metaReviewTasks) {
        items.push({
          label: props.intl.formatMessage(messages.metaUnreviewed),
          value: TaskMetaReviewStatusWithUnset.metaUnset
        })
        items.push({
          label: props.intl.formatMessage(messagesByMetaReviewStatus[TaskReviewStatus.needed]),
          value: TaskReviewStatus.needed
        })
      } else {
        items.push({
          label: props.intl.formatMessage(messages.metaUnreviewed),
          value: TaskMetaReviewStatusWithUnset.metaUnset
        })
        _each(TaskReviewStatus, (status) => {
          if (status !== TaskReviewStatus.unnecessary && isMetaReviewStatus(status)) {
            items.push({
              label: props.intl.formatMessage(messagesByMetaReviewStatus[status]),
              value: status
            })
          }
        })
      }

      return (
        <div className='mr-space-x-1 mr-flex'>
          <div className='mr-w-full mr-flex-shrink-0'>
            <TaskFilterMultiSelectDropdown 
              itemList={items}
              filterState={props.taskMetaReviewStatusFilterIds}
              onChange={item => {
                onChange(item)
                setTimeout(() => props.updateTaskStatusFiltersByCategory(item, "taskMetaReviewStatusFilterIds"), 0)
              }}   
            />
          </div>
          {props.taskMetaReviewStatusFilterIds.length < initialTaskStatusFilters.metaReviewStatus.length && (
            <button 
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={() => {
                onChange(initialTaskStatusFilters.metaReviewStatus.join(','))
                setTimeout(() => props.clearTaskStatusFiltersByCategory("metaReviewStatus", "taskMetaReviewStatusFilterIds"), 0)
              }}
            >
              <SvgSymbol sym="icon-close" viewBox="0 0 20 20" className="mr-fill-current mr-w-2.5 mr-h-2.5"/>
            </button>
          )}
        </div>
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
    Cell: ({ row }) => {
      const linkTo = `/challenge/${row._original.parent.id}/task/${row._original.id}/review`
      let action = (
        <Link 
          to={linkTo} 
          onClick={(e) => handleClick(e, linkTo)}
          className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
        >
          <FormattedMessage {...messages.reviewTaskLabel} />
        </Link>
      )

      if (row._original.reviewedBy) {
        if (row._original.reviewStatus === TaskReviewStatus.needed) {
          action = (
            <Link 
              to={linkTo} 
              onClick={(e) => handleClick(e, linkTo)}
              className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
            >
              <FormattedMessage {...messages.reviewAgainTaskLabel} />
            </Link>
          )
        } else if (row._original.reviewStatus === TaskReviewStatus.disputed) {
          action = (
            <Link 
              to={linkTo} 
              onClick={(e) => handleClick(e, linkTo)}
              className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
            >
              <FormattedMessage {...messages.resolveTaskLabel} />
            </Link>
          )
        }
      }

      return (
        <div className="row-controls-column">
          {action}
        </div>
      )
    }
  }

  columns.reviewCompleteControls = {
    id: 'controls',
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    sortable: false,
    maxWidth: 110,
    Cell: ({ row }) => {
      let linkTo = `/challenge/${row._original.parent.id}/task/${row._original.id}`
      let message = <FormattedMessage {...messages.viewTaskLabel} />

      // The mapper needs to rereview a contested task.
      if (row._original.reviewStatus === TaskReviewStatus.disputed ||
          row._original.metaReviewStatus === TaskReviewStatus.rejected) {
        linkTo += "/review"
        message = <FormattedMessage {...messages.resolveTaskLabel} />
      }

      return (
        <div className="row-controls-column mr-links-green-lighter">
          <Link
            to={linkTo} 
            onClick={(e) => handleClick(e, linkTo)}
          >
            {message}
          </Link>
        </div>
      )
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
      let action =(
        <Link 
          to={linkTo} 
          onClick={(e) => handleClick(e, linkTo)}
          className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
        >
          <FormattedMessage {...messages.metaReviewTaskLabel} />
        </Link>
      )
  
      if (row._original.reviewedBy) {
        if (row._original.reviewStatus === TaskReviewStatus.needed) {
          action = (
            <Link 
              to={linkTo}  
              onClick={(e) => handleClick(e, linkTo)}
              className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
            >
              <FormattedMessage {...messages.reviewAgainTaskLabel} />
            </Link>
          )
        } 
        else if (row._original.reviewStatus === TaskReviewStatus.disputed) {
          action = (
            <Link 
              to={linkTo}  
              onClick={(e) => handleClick(e, linkTo)}
              className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
            >
              <FormattedMessage {...messages.resolveTaskLabel} />
            </Link>
          )
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
    Cell: ({ row }) => {
      const linkTo = `/challenge/${row._original.parent.id}/task/${row._original.id}`
      let message =
        row._original.reviewStatus === TaskReviewStatus.rejected ? (
          <FormattedMessage {...messages.fixTaskLabel} />
        ) : (
          <FormattedMessage {...messages.viewTaskLabel} />
        )
  
      return (
        <div className="row-controls-column mr-links-green-lighter">
          <Link
            to={linkTo}
            onClick={(e) => handleClick(e, linkTo)}
          >
            {message}
          </Link>
          {!props.metaReviewEnabled &&
            row._original.reviewStatus !== TaskReviewStatus.needed &&
            row._original.reviewedBy &&
            row._original.reviewedBy.id !== props.user?.id && (
              <Link
                to={`${linkTo}/review`}
                onClick={(e) => handleClick(e, `${linkTo}/review`)}
                className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
              >
                <FormattedMessage {...messages.reviewFurtherTaskLabel} />
              </Link>
            )}
        </div>
      )
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
          value={filter ? _get(filter, 'value') : ''}
        />
      )
    }
  }

  return columns
}

