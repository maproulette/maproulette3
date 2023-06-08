import React, { Component } from 'react'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import TasksReviewTable from '../../../pages/Review/TasksReview/TasksReviewTable'
import QuickWidget from '../../QuickWidget/QuickWidget'
import TaskClusterMap from '../../TaskClusterMap/TaskClusterMap'
import WithReviewTaskClusters from '../../HOCs/WithReviewTaskClusters/WithReviewTaskClusters'
import WithTaskClusterMarkers from '../../HOCs/WithTaskClusterMarkers/WithTaskClusterMarkers'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ReviewTableWidget',
  label: messages.label,
  targets: [WidgetDataTarget.review],
  minWidth: 10,
  defaultWidth: 10,
  minHeight: 18,
  defaultHeight: 18,
}

const BrowseMap =
  WithReviewTaskClusters(WithTaskClusterMarkers(TaskClusterMap('reviewBrowse')))

export default class ReviewTableWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="review-table-widget"
        noMain
      >
        <TasksReviewTable {...this.props} BrowseMap={BrowseMap} />
      </QuickWidget>
    )
  }
}

registerWidgetType(ReviewTableWidget, descriptor)
