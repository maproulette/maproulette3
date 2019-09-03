import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _uniq from 'lodash/uniq'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import WithCurrentUser from '../../HOCs/WithCurrentUser/WithCurrentUser'
import WithEditor from '../../HOCs/WithEditor/WithEditor'
import WithLockedTask from '../../HOCs/WithLockedTask/WithLockedTask'
import ActiveTaskControls
       from '../../TaskPane/ActiveTaskDetails/ActiveTaskControls/ActiveTaskControls'
import InspectTaskControls from '../../InspectTaskControls/InspectTaskControls'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

import Button from '../../Button/Button'

const descriptor = {
  widgetKey: 'TaskCompletionWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 3,
  defaultHeight: 12,
}

export default class TaskCompletionWidget extends Component {
  bundleTasks = () => {
    this.props.createTaskBundle(
      _uniq([this.props.task.id].concat([...this.props.selectedTasks.keys()]))
    )
  }

  render() {
    let taskControls =
      this.props.inspectTask ?
      <InspectTaskControls {...this.props} /> :
      <ActiveTaskControls {...this.props} />

    let taskCount = _get(this.props, 'taskBundle.taskIds.length', 0)

    // If we have selected Tasks but no tasks in bundle, a bundle was started
    // but not created with server
    if (_get(this.props, 'selectedTasks.size') > 0 && taskCount === 0) {
      taskCount = this.props.selectedTasks.size + 1
      taskControls =
        <div className="mr-pt-2">
          <Button onClick={this.bundleTasks} className="mr-mr-2">
            <FormattedMessage {...messages.completeTogether} />
          </Button>
          <Button onClick={() => this.props.resetSelectedTasks()}>
            <FormattedMessage {...messages.cancelSelection} />
          </Button>
        </div>
    }

    return (
      <QuickWidget
        {...this.props}
        className="task-controls-widget"
        widgetTitle={
          this.props.inspectTask ?
          <FormattedMessage {...messages.inspectTitle} /> :
          <FormattedMessage {...messages.title} />
        }
        noMain
        permanent
      >
        { taskCount > 0 &&
         <div className="mr-text-pink-light mr-mb-2 mr-text-base">
           <FormattedMessage
             {...messages.simultaneousTasks}
             values={{taskCount: taskCount}}
           />
         </div>
        }
        {taskControls}
      </QuickWidget>
    )
  }
}

registerWidgetType(WithCurrentUser(WithEditor(WithLockedTask(TaskCompletionWidget))), descriptor)
