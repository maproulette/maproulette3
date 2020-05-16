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
import Dropdown from '../Dropdown/Dropdown'
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
        <li
          key={task.id}
          className="mr-h-5 mr-my-2 mr-flex mr-justify-between mr-items-center"
        >
          <Link to={`/challenge/${task.parent.id}/task/${task.id}`}>
            <span className="saved-tasks__task__name">{task.name}</span> &mdash; {task.parent.name}
          </Link>
          <div className="mr-h-5">
            <Dropdown
              className="mr-dropdown--right"
              dropdownButton={dropdown => (
                <button
                  onClick={dropdown.toggleDropdownVisible}
                  className="mr-flex mr-items-center mr-text-white-40"
                >
                  <SvgSymbol
                    sym="navigation-more-icon"
                    viewBox="0 0 20 20"
                    className="mr-fill-current mr-w-5 mr-h-5"
                  />
                </button>
              )}
              dropdownContent={() =>
                <ul className="mr-list-dropdown mr-links-green-lighter">
                  <li>
                    <Link to={`/challenge/${task.parent.id}/task/${task.id}`}>
                      <FormattedMessage {...messages.viewTask} />
                    </Link>
                  </li>
                  <li>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a onClick={() => props.unsaveTask(props.user.id, task.id)}>
                      <FormattedMessage {...messages.unsave} />
                    </a>
                  </li>
                </ul>
              }
            />
          </div>
        </li>
      )
    }
  ))

  return (
    taskItems.length > 0 ?
    <ol className="mr-list-reset mr-links-green-lighter mr-pb-24">
      {taskItems}
    </ol> :
    <div className="mr-text-grey-lighter">
      <FormattedMessage {...messages.noTasks} />
    </div>
  )
}

registerWidgetType(SavedTasksWidget, descriptor)
