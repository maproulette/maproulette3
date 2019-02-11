import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import _isFinite from 'lodash/isFinite'
import { Link } from 'react-router-dom'
import { WidgetDataTarget, registerWidgetType }
       from '../../services/Widget/Widget'
import QuickWidget from '../QuickWidget/QuickWidget'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'

const descriptor = {
  widgetKey: 'SavedTasksWidget',
  label: messages.header,
  targets: [
    WidgetDataTarget.user,
  ],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 2,
  defaultHeight: 5,
}

export default class SavedTasksWidget extends Component {
  componentDidMount() {
    if (this.props.user && this.props.fetchSavedTasks) {
      this.props.fetchSavedTasks(this.props.user.id)
    }
  }

  render() {
    return (
      <QuickWidget
        {...this.props}
        className="saved-tasks-widget"
        widgetTitle={<FormattedMessage {...messages.header} />}
      >
        <SavedTaskList {...this.props} />
      </QuickWidget>
    )
  }
}

const SavedTaskList = function(props) {
  const taskItems =
    _compact(_map(_get(props, 'user.savedTasks', []), task => {
      if (!_isFinite(_get(task, 'parent.id'))) {
        return null
      }

      return (
        <li key={task.id} className="mr-mb-2 mr-flex mr-items-center">
          <button
            className="mr-mr-2 mr-text-grey-light hover:mr-text-red"
            onClick={() => props.unsaveTask(props.user.id, task.id)}
          >
            <SvgSymbol
              sym="minus-outline-icon"
              viewBox="0 0 32 32"
              className="mr-fill-current mr-w-4 mr-h-4"
            />
          </button>
          <Link to={`/challenge/${task.parent.id}/task/${task.id}`}>
            <span className="saved-tasks__task__name">{task.name}</span> &mdash; {task.parent.name}
          </Link>
        </li>
      )
    }
  ))

  return taskItems.length > 0 ?
         <ol className="mr-list-reset">{taskItems}</ol> :
         <div className="none">No Tasks</div>
}

registerWidgetType(SavedTasksWidget, descriptor)
