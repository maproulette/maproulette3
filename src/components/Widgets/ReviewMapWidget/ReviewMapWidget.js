import React, { Component } from 'react'
import _omit from 'lodash/omit'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import TaskClusterMap from '../../TaskClusterMap/TaskClusterMap'
import WithReviewTaskClusters from '../../HOCs/WithReviewTaskClusters/WithReviewTaskClusters'
import WithTaskClusterMarkers from '../../HOCs/WithTaskClusterMarkers/WithTaskClusterMarkers'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ReviewMapWidget',
  label: messages.label,
  targets: [WidgetDataTarget.review],
  minWidth: 6,
  defaultWidth: 10,
  minHeight: 6,
  defaultHeight: 10,
}

const BrowseMap =
  WithReviewTaskClusters(WithTaskClusterMarkers(TaskClusterMap('reviewBrowse')))

export default class ReviewMapWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="review-map-widget"
        noMain
      >
        <MapPane>
          <BrowseMap {..._omit(this.props, ['className'])} />
        </MapPane>
      </QuickWidget>
    )
  }
}

registerWidgetType(ReviewMapWidget, descriptor)
