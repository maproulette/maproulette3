import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import WithCurrentUser from '../../HOCs/WithCurrentUser/WithCurrentUser'
import ReviewTaskControls from '../../ReviewTaskControls/ReviewTaskControls'
import QuickWidget from '../../QuickWidget/QuickWidget'
import { TaskReviewStatus } from '../../../services/Task/TaskReview/TaskReviewStatus'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskReviewWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 3,
  defaultHeight: 12,
}

export default class TaskReviewWidget extends Component {
  render() {
    const title = this.props.asMetaReview ?
      <FormattedMessage {...messages.metaReviewTaskTitle} /> :
      (this.props.task.metaReviewStatus === TaskReviewStatus.rejected ?
        <FormattedMessage {...messages.reviewRevisionTaskTitle} /> :
        <FormattedMessage {...messages.reviewTaskTitle} />
      )

    return (
      <QuickWidget
        {...this.props}
        className="task-controls-widget"
        widgetTitle={title}
        noMain
      >
        {this.props.taskBundle &&
         <div className="mr-text-pink-light mr-mb-2 mr-text-base">
           <FormattedMessage
             {...messages.simultaneousTasks}
             values={{taskCount: this.props.taskBundle.tasks.length}}
           />
         </div>
        }
        <ReviewTaskControls {...this.props} className="" />
      </QuickWidget>
    )
  }
}

registerWidgetType(WithCurrentUser(TaskReviewWidget), descriptor)
