import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import WithSearch from '../../../../HOCs/WithSearch/WithSearch'
import WithTaskReview from '../../../../HOCs/WithTaskReview/WithTaskReview'
import WithTaskTags from '../../../../HOCs/WithTaskTags/WithTaskTags'
import WithKeyboardShortcuts
       from '../../../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import Dropdown from '../../../../Dropdown/Dropdown'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
import TaskFixedControl
       from '../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskFixedControl/TaskFixedControl'
import TaskSkipControl
       from '../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskSkipControl/TaskSkipControl'
import TaskTooHardControl
       from '../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskTooHardControl/TaskTooHardControl'
import TaskFalsePositiveControl
       from '../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskFalsePositiveControl/TaskFalsePositiveControl'
import TaskAlreadyFixedControl
       from '../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskAlreadyFixedControl/TaskAlreadyFixedControl'
import BusySpinner from '../../../../BusySpinner/BusySpinner'
import UserEditorSelector
       from '../../../../UserEditorSelector/UserEditorSelector'
import messages from './Messages'

export class CooperativeWorkControls extends Component {
  state = {
    showDiffModal: false,
  }

  render() {
    if (!this.props.task) {
      return null
    }

    return (
      <div className="mr-pb-2">
        {this.props.loadingOSMData && <BusySpinner />}

        <p className="mr-text-md mr-mb-2">
          <FormattedMessage {...messages.prompt} />
        </p>
        <div className="mr-my-2 breadcrumb mr-w-full mr-flex mr-flex-wrap mr-m-auto">
          {this.props.allowedProgressions.has(TaskStatus.fixed) &&
            <TaskFixedControl
              {...this.props}
              fixedLabel={<FormattedMessage {...messages.confirmLabel} />}
            />
          }

          {this.props.allowedProgressions.has(TaskStatus.falsePositive) &&
            <TaskFalsePositiveControl
              {...this.props}
              falsePositiveLabel={<FormattedMessage {...messages.rejectLabel} />}
            />
          }
        </div>
        
        <UserEditorSelector
          {...this.props}
          className="mr-mb-4"
        />
          <div className="mr-my-2 breadcrumb mr-w-full mr-flex mr-flex-wrap mr-m-auto">
          {this.props.allowedProgressions.has(TaskStatus.skipped) &&
            <TaskSkipControl {...this.props} />
          }

          {this.props.allowedProgressions.has(TaskStatus.tooHard) &&
            <TaskTooHardControl {...this.props} />
          }

          {this.props.allowedProgressions.has(TaskStatus.alreadyFixed) &&
            <TaskAlreadyFixedControl {...this.props} />
          }
        </div>
      </div>
    )
  }
}

export default
  WithSearch(
    WithTaskTags(
      WithTaskReview(
        WithKeyboardShortcuts(
          injectIntl(CooperativeWorkControls)
        )
      )
    ),
    'task'
  )
