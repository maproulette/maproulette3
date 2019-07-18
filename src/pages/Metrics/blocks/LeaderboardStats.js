import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import messages from '../Messages'
import QuickWidget from '../../../components/QuickWidget/QuickWidget'
import _map from 'lodash/map'

export default class LeaderboardStats extends Component {
  render() {
    if (!this.props.leaderboardMetrics) {
      return null
    }

    return (
      <QuickWidget
        {...this.props}
        className="mr-card-widget mr-card-widget--padded mr-mb-4"
        widgetTitle={
          <FormattedMessage {...messages.leaderboardTitle} />
        }
        noMain
        permanent
      >
        <ul className="mr-list-reset mr-mt-3 mr-mb-6">
          <li className="mr-flex mr-items-center">
            <strong className="mr-font-light mr-text-4xl mr-min-w-28 mr-text-yellow">
              {this.props.leaderboardMetrics.rank}
            </strong>
            <FormattedMessage {...messages.globalRank} />
          </li>
          <li className="mr-flex mr-items-center">
            <strong className="mr-font-light mr-text-4xl mr-min-w-28 mr-text-yellow">
              {this.props.leaderboardMetrics.score}
            </strong>
            <FormattedMessage {...messages.totalPoints} />
          </li>
        </ul>
        <h3 className="mr-text-base mr-pb-3 mr-mb-3 mr-border-b mr-border-white-10">
          <FormattedMessage {...messages.topChallenges} />
        </h3>
        <ol className="mr-list-reset">
          {_map(this.props.leaderboardMetrics.topChallenges.slice(0, 4), (challenge, index) => {
            return (
              <li key={index}>
                <a href={"/browse/challenges/" + challenge.id}>{challenge.name}</a>
              </li>
            )
          })}
        </ol>
      </QuickWidget>
    )
  }
}
