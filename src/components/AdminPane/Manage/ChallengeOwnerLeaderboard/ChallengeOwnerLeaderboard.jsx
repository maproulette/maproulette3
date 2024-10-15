import { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedNumber, FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'

import { TaskReviewStatus, messagesByReviewStatus }
       from '../../../../services/Task/TaskReview/TaskReviewStatus'
import { USER_TYPE_REVIEWER } from '../../../../services/Leaderboard/Leaderboard'

import messages from './Messages'

export default class ChallengeOwnerLeaderboard extends Component {
  render() {
    const userType = this.props.userType

    if (!this.props.leaderboard) {
      return null
    }

    const showNumberTasks = this.props.leaderboard.length > 0 ?
      this.props.leaderboard[0].completedTasks > 0 : false

    const leaders = _map(
      this.props.leaderboard.slice(0, 9), leader => {
        const avgTimeSpent = leader.avgTimeSpent && leader.avgTimeSpent > 0 ?
          `${Math.floor(leader.avgTimeSpent / 1000 / 60)}m ${Math.floor(leader.avgTimeSpent / 1000) % 60}s`
          : null

        let tooltip = userType !== USER_TYPE_REVIEWER ? "" :
          `${this.props.intl.formatMessage(messagesByReviewStatus[TaskReviewStatus.approved])}: ${leader.reviewsApproved} \n` +
          `${this.props.intl.formatMessage(messagesByReviewStatus[TaskReviewStatus.approvedWithFixes])}: ${leader.reviewsAssisted} \n` +
          `${this.props.intl.formatMessage(messagesByReviewStatus[TaskReviewStatus.rejected])}: ${leader.reviewsRejected} \n` +
          `-------\n` +
          `${this.props.intl.formatMessage(messagesByReviewStatus[TaskReviewStatus.disputed])}: ${leader.reviewsDisputed} \n`

        if (leader.additionalReviews > 0) {
          tooltip += `${this.props.intl.formatMessage(messages.additionalReviews)}: ${leader.additionalReviews} \n`
        }

        return (
          <li key={leader.userId} className="mr-mb-2 mr-flex mr-justify-between">
            <div className="mr-text-sm">
              <span className="mr-text-pink mr-font-mono mr-mr-4">
                <FormattedNumber value={leader.rank} />.
              </span>
              <Link to={`/user/metrics/${leader.userId}`} title={tooltip}>
                {leader.name}
              </Link>
            </div>
            <div className="mr-flex mr-justify-end mr-text-right mr-text-sm">
              {userType !== USER_TYPE_REVIEWER &&
                <div className="mr-w-16 mr-ml-2">{leader.score}</div>
              }
              {showNumberTasks &&
                <Fragment>
                  <div className="mr-w-16 mr-ml-2">{leader.completedTasks}</div>
                  <div className="mr-w-16 mr-ml-2">{avgTimeSpent}</div>
                </Fragment>
              }
            </div>
          </li>
        );
      }
    )

    return (
      <Fragment>
        {leaders.length > 0 &&
          <div className="mr-flex mr-justify-between mr-text-pink mr-mb-2">
            <div></div>
            <div className="mr-flex mr-justify-end mr-text-right mr-text-sm mr-mb-2">
              {userType !== USER_TYPE_REVIEWER &&
                <div className="mr-w-16 mr-ml-2">
                  <FormattedMessage {...messages.pointsLabel} />
                </div>
              }
              {showNumberTasks &&
                <Fragment>
                  <div className="mr-w-16 mr-ml-2">
                    {userType === USER_TYPE_REVIEWER ?
                      <FormattedMessage {...messages.reviewsCompletedLabel}/> :
                      <FormattedMessage {...messages.tasksCompletedLabel}/>
                    }

                  </div>
                  <div className="mr-w-16 mr-ml-2">
                    <FormattedMessage {...messages.averageTimeLabel}/>
                  </div>
                </Fragment>
              }
            </div>
          </div>
        }
        <ol className="mr-list-reset mr-links-green-lighter mr-text-lg">
          {leaders}
        </ol>
      </Fragment>
    );
  }
}

ChallengeOwnerLeaderboard.propTypes = {
  leaderboard: PropTypes.array,
}
