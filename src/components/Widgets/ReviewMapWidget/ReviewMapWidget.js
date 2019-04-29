import React, { Component } from 'react'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import ReviewBrowseMap from '../../../pages/Review/ReviewBrowseMap/ReviewBrowseMap'
import WithReviewTaskClusters from '../../HOCs/WithReviewTaskClusters/WithReviewTaskClusters'
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

const BrowseMap = WithReviewTaskClusters(ReviewBrowseMap)

export default class ReviewMapWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="review-map-widget"
        noMain
      >
        <MapPane {...this.props}>
          <BrowseMap {...this.props} />
        </MapPane>
      </QuickWidget>
    )
  }
}

registerWidgetType(ReviewMapWidget, descriptor)
