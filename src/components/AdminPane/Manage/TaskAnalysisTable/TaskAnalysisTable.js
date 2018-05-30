import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTable from 'react-table'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import { messagesByStatus,
         keysByStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { messagesByPriority }
       from '../../../../services/Task/TaskPriority/TaskPriority'
import WithLoadedTask from '../../HOCs/WithLoadedTask/WithLoadedTask'
import ViewTask from '../ViewTask/ViewTask'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import '../../../../../node_modules/react-table/react-table.css'
import './TaskAnalysisTable.css'

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
  render() {
    if (!_isObject(this.props.challenge) ||
        !_isObject(this.props.challenge.parent)) {
      return null
    }

    const taskBaseRoute = 
      `/admin/project/${this.props.challenge.parent.id}` +
      `/challenge/${this.props.challenge.id}/task`

    // Setup tasks table. See react-table docs for details.
    const data = _get(this.props, 'taskInfo.tasks', [])
    const columns = [{
      id: 'id',
      Header: this.props.intl.formatMessage(messages.idLabel),
      accessor: 'id',
      exportable: t => t.id,
      maxWidth: 95,
    }, {
      id: 'name',
      Header: this.props.intl.formatMessage(messages.nameLabel),
      accessor: t => t.name || t.title,
      exportable: t => t.name || t.title,
    }, {
      id: 'status',
      Header: this.props.intl.formatMessage(messages.statusLabel),
      accessor: 'status',
      exportable: t => this.props.intl.formatMessage(messagesByStatus[t.status]),
      Cell: ({value}) => (
        <div>
          <SvgSymbol sym='circle-icon'
                     viewBox='0 0 20 20'
                     className={classNames("status-icon",
                                           keysByStatus[value])} />
          <FormattedMessage {...messagesByStatus[value]} />
        </div>
      ),
    }, {
      id: 'priority',
      Header: this.props.intl.formatMessage(messages.priorityLabel),
      accessor: 'priority',
      exportable: t => this.props.intl.formatMessage(messagesByPriority[t.priority]),
      maxWidth: 90,
      Cell: ({value}) => (
        <div>
          <FormattedMessage {...messagesByPriority[value]} />
        </div>
      ),
    }, {
      id: 'controls',
      Header: this.props.intl.formatMessage(messages.actionsColumnHeader),
      sortable: false,
      minWidth: 110,
      Cell: ({row}) =>
        <div className="row-controls-column">
          <Link to={`${taskBaseRoute}/${row.id}/review`}>
            <FormattedMessage {...messages.reviewTaskLabel} />
          </Link>
          <Link to={`${taskBaseRoute}/${row.id}/edit`}>
            <FormattedMessage {...messages.editTaskLabel} />
          </Link>
          <Link to={`/challenge/${this.props.challenge.id}/task/${row.id}`}>
            <FormattedMessage {...messages.startTaskLabel} />
          </Link>
        </div>
    }]

    // Setup wrapper that displays total tasks available, percentage
    // currently included in the table, CSV export option, etc.
    const taskCountWrapper = [{
      id: 'taskCount',
      Header: () => {
        const countShown = data.length

        if (_get(this.props, 'totalTaskCount', 0) < 1) {
          return <FormattedMessage {...messages.taskCountShownStatus}
                                   values={{countShown}} />
        }

        const percentShown =
          Math.round(data.length / this.props.totalTaskCount * 100.0)

        return (
          <div className="table-status-bar">
            <FormattedMessage {...messages.taskPercentShownStatus}
                                  values={{
                                    percentShown,
                                    countShown,
                                    countTotal: this.props.totalTaskCount,
                                  }} />
            <a target="_blank"
               href={`/api/v2/challenge/${_get(this.props, 'challenge.id')}/tasks/extract`}
               className="button is-outlined has-svg-icon csv-export"
            >
              <SvgSymbol sym='download-icon' viewBox='0 0 20 20' />
              <FormattedMessage {...messages.exportCSVLabel} />
            </a>
          </div>
        )
      },
      columns: columns,
    }]

    return (
      <div className="task-analysis-table">
        <ReactTable data={data} columns={taskCountWrapper}
                    SubComponent={props =>
                      <ViewTaskSubComponent taskId={props.original.id} />
                    }
                    collapseOnDataChange={false}
        />
      </div>
    )
  }
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
}

export default injectIntl(TaskAnalysisTable)
