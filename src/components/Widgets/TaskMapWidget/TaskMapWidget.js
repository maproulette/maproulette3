import React, { Component } from 'react'
import _get from 'lodash/get'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import { isFinalStatus } from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatus }
       from '../../../services/Task/TaskReview/TaskReviewStatus'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import TaskMap from '../../TaskPane/TaskMap/TaskMap'
import TagDiffVisualization from '../../TagDiffVisualization/TagDiffVisualization'
import TagDiffModal from '../../TagDiffVisualization/TagDiffModal'
import BusySpinner from '../../BusySpinner/BusySpinner'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskMapWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 9,
  minHeight: 5,
  defaultHeight: 19,
}

export default class TaskMapWidget extends Component {
  state = {
    showDiffModal: false,
  }

  render() {
    return (
      <QuickWidget
        {...this.props}
        className="task-map-widget"
        noMain
        permanent
      >
        <TagDiff
          {...this.props}
          showDiffModal={() => this.setState({showDiffModal: true})}
        />

        <MapPane {...this.props}>
          <TaskMap {...this.props} challenge={this.props.task.parent} />
        </MapPane>

        {this.state.showDiffModal &&
         <TagDiffModal
           {...this.props}
           onClose={() => this.setState({showDiffModal: false})}
         />
        }
      </QuickWidget>
    )
  }
}

export const TagDiff = props => {
  const needsRevised = props.task.reviewStatus === TaskReviewStatus.rejected
  if (props.task.suggestedFix && (!isFinalStatus(props.task.status) || needsRevised)) {
    if (props.loadingOSMData) {
      return (
        <div className="mr-mb-4">
          <BusySpinner />
        </div>
      )
    }

    return (
      <div className="mr-mb-4">
        <TagDiffVisualization
          {...props}
          compact
          onlyChanges
          tagDiff={_get(props, 'tagDiffs[0]')}
        />
      </div>
    )
  }

  return null
}

registerWidgetType(TaskMapWidget, descriptor)
