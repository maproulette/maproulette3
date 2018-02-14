import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTable from 'react-table'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import { messagesByStatus,
         keysByStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import WithLoadedTask from '../../HOCs/WithLoadedTask/WithLoadedTask'
import ViewTask from '../ViewTask/ViewTask'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './TaskAnalysisTable.css'

const ViewTaskSubComponent = WithLoadedTask(ViewTask)

export class TaskAnalysisTable extends Component {
  render() {
    const taskBaseRoute = 
      `/admin/project/${this.props.challenge.parent.id}` +
      `/challenge/${this.props.challenge.id}/task`

    const data = _get(this.props, 'taskInfo.tasks', [])
    const columns = [{
      id: 'id',
      Header: this.props.intl.formatMessage(messages.idLabel),
      accessor: 'id',
    }, {
      id: 'name',
      Header: this.props.intl.formatMessage(messages.nameLabel),
      accessor: t => t.name || t.title,
    }, {
      id: 'status',
      Header: this.props.intl.formatMessage(messages.statusLabel),
      accessor: 'status',
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
      id: 'controls',
      Header: this.props.intl.formatMessage(messages.actionsColumnHeader),
      sortable: false,
      Cell: ({row}) =>
        <div className="task-row-controls">
          <Link to={`${taskBaseRoute}/${row.id}/review`}>Review</Link>
          <Link to={`${taskBaseRoute}/${row.id}/edit`}>Edit</Link>
        </div>
    }]

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

        return <FormattedMessage {...messages.taskPercentShownStatus}
                                 values={{
                                   percentShown,
                                   countShown,
                                   countTotal: this.props.totalTaskCount,
                                 }} />
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
}

export default injectIntl(TaskAnalysisTable)
