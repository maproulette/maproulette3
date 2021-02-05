import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _isEqual from 'lodash/isEqual'
import _get from 'lodash/get'
import messages from './Messages'
import ChallengeProgress from './ChallengeProgress'
import ReviewStatusMetrics from '../../pages/Review/Metrics/ReviewStatusMetrics'

export class ChallengeSnapshotProgress extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render if the challenge, metrics or visibility changes
    if (!_isEqual(nextProps.taskMetrics, this.props.taskMetrics)) {
      return true
    }

    if (_get(nextProps, 'challenge.id') !== _get(this.props, 'challenge.id')) {
      return true
    }

    if (!_isEqual(this.props.showByPriority, nextProps.showByPriority)) {
      return true
    }
    return false
  }


  render() {
    return (
      <div className="">
        <ChallengeProgress {...this.props} />
        <div className="">
          <div className="mr-my-4 mr-text-turquoise mr-text-lg mr-font-medium">
            <FormattedMessage {...messages.reviewStatusLabel} />
          </div>
          <ReviewStatusMetrics {...this.props} />
        </div>
      </div>
    )
  }
}

export default ChallengeSnapshotProgress
