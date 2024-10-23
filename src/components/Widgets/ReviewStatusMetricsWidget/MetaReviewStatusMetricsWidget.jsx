import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _indexOf from 'lodash/indexOf'
import _isEqual from 'lodash/isEqual'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import ReviewStatusMetrics from '../../../pages/Review/Metrics/ReviewStatusMetrics'
import WithReviewMetrics from '../../HOCs/WithReviewMetrics/WithReviewMetrics'
import WithChallengeReviewMetrics
      from '../../AdminPane/HOCs/WithChallengeReviewMetrics/WithChallengeReviewMetrics'
import WithProjectReviewMetrics
      from '../../AdminPane/HOCs/WithProjectReviewMetrics/WithProjectReviewMetrics'

import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'MetaReviewStatusMetricsWidget',
  label: messages.metaReviewlabel,
  targets: import.meta.env.REACT_APP_FEATURE_META_QC === 'enabled' ?
    [WidgetDataTarget.review, WidgetDataTarget.challenge,
     WidgetDataTarget.challenges] : [],
  minWidth: 2,
  defaultWidth: 4,
  minHeight: 4,
  defaultHeight: 6,
  defaultConfiguration: {
    showByPriority: false,
  },
}

export default class MetaReviewStatusMetricsWidget extends Component {
  ReviewStatusMetricsComponent = null

  setShowByPriority = showByPriority => {
    this.props.updateWidgetConfiguration({showByPriority: !!showByPriority})
  }

  setShowByTaskStatus = showByTaskStatus => {
    this.props.updateWidgetConfiguration({showByTaskStatus: !!showByTaskStatus})
  }

  setupReviewMetricsHOC = targets => {
    if (targets === WidgetDataTarget.review ||
        _indexOf(targets, WidgetDataTarget.review) > -1) {
      return WithReviewMetrics(ReviewStatusMetrics)
    }

    if (targets === WidgetDataTarget.challenge ||
        _indexOf(targets, WidgetDataTarget.challenge) > -1) {
      return WithChallengeReviewMetrics(ReviewStatusMetrics)
    }

    if (targets === WidgetDataTarget.project ||
        _indexOf(targets, WidgetDataTarget.project) > -1) {
      return WithProjectReviewMetrics(ReviewStatusMetrics)
    }
  }

  componentDidMount() {
    this.ReviewStatusMetricsComponent = this.setupReviewMetricsHOC(this.props.targets)
  }

  componentDidUpdate(prevProps) {
    if (!_isEqual(prevProps.targets, this.props.targets)) {
      this.ReviewStatusMetricsComponent = this.setupReviewMetricsHOC(this.props.targets)
    }
  }

  render() {
    // Wait until our props are setup
    if (!this.ReviewStatusMetricsComponent) return null

    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={
          <FormattedMessage {...messages.metaReviewStatusTitle} />
        }
        noMain
      >
        <this.ReviewStatusMetricsComponent
          asMetaReview
          {...this.props}
          showByPriority={this.props.widgetConfiguration.showByPriority}
          setShowByPriority={this.setShowByPriority}
          showByTaskStatus={this.props.widgetConfiguration.showByTaskStatus}
          setShowByTaskStatus={this.setShowByTaskStatus}
        />
      </QuickWidget>
    )
  }
}


/**
 * Allow this widget to be treated as a conditional widget, returning true or
 * false as to whether it should be hidden given the current workspace props
 */
MetaReviewStatusMetricsWidget.hideWidget = function() {
  return import.meta.env.REACT_APP_FEATURE_META_QC !== 'enabled'
}


registerWidgetType(MetaReviewStatusMetricsWidget, descriptor)
