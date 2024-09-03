import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import AsUserActivity from '../../interactions/Activity/AsUserActivity'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import messages from './Messages'

const NEWBIE_POINTS_THRESHOLD = 49

const DashboardHeader = props => {
  const latestChallenge = AsUserActivity(props.user.activity).recentChallengeId()
  const completedTasks = _get(props.taskMetrics, 'total', 0)
  const userScore = _get(props.leaderboardMetrics, 'score')
  const rank = _get(props.leaderboardMetrics, 'rank')

  const welcomeBackInterface = () => {
    if (_isFinite(userScore)) {
      return (
        <p>
          <FormattedMessage {...messages.completionPrompt} />
          <span className="mr-ml-1 mr-font-bold mr-text-pink">
            <FormattedMessage
              {...messages.completedTasks}
              values={{ completedTasks }}
            />
          </span>
          <FormattedMessage {...messages.pointsPrompt} />
          <span className="mr-ml-1 mr-font-bold mr-text-pink">
            <FormattedMessage
              {...messages.points}
              values={{ points: userScore }}
            />
          </span>
          <FormattedMessage {...messages.rankPrompt} />
          <span className="mr-mx-1 mr-font-bold mr-text-pink">
            <FormattedMessage {...messages.rank} values={{ rank }} />
          </span>
          <FormattedMessage {...messages.globally} />{" "}
          <FormattedMessage
            {...(userScore > NEWBIE_POINTS_THRESHOLD
              ? messages.encouragement
              : messages.getStarted)}
          />
        </p>
      )
    }
  
    return _isFinite(completedTasks) ? (
      <FormattedMessage {...messages.getStarted} />
    ) : (
      <BusySpinner />
    )
  }

  return (
    <div className="mr-mx-4 mr-mt-12">
      <div className="mr-flex mr-flex-col mr-items-center mr-bg-blue-dark mr-rounded mr-w-full">
        <div className="mr-flex mr-justify-between mr-px-4 mr-h-64 mr-w-full mr-px-20 mr-pt-8 mr--mb-8 mr-relative">
          <div className="mr-pr-1/2">
            <h2 className="mr-text-yellow mr-font-light mr-text-4xl mr-mb-8">
              <FormattedMessage
                {...messages.welcome}
                values={{username: props.user.osmProfile.displayName}}
              />
            </h2>
            {welcomeBackInterface()}
          </div>
          <div className="mr-bg-home mr-w-1/3 mr-h-64 mr-absolute mr-right-0 mr-top-0 mr--mt-16 mr-mr-24" />
        </div>
        <div className="mr-bg-black-25 mr-w-full mr-py-4 mr-pl-8 mr-rounded-b">
          <div className="mr-bg-lines mr-p-4 mr-pl-12 mr-flex mr-justify-between mr-items-center">
            {_isFinite(latestChallenge) ?
             <React.Fragment>
               <div className="mr-flex mr-items-center mr-mr-8">
                 <div className="mr-mr-4 mr-flex mr-flex-wrap">
                   <span className="mr-mr-1">
                     <FormattedMessage {...messages.jumpBackIn} />
                   </span>
                   <FormattedMessage {...messages.resume} />
                 </div>
                 <div>
                   <Link
                     to={`/browse/challenges/${latestChallenge}`}
                     className="mr-button"
                   >
                     <FormattedMessage {...messages.latestChallengeLabel} />
                   </Link>
                 </div>
               </div>
               <div className="mr-flex mr-items-center mr-mr-20">
                 <div className="mr-mr-4 mr-flex mr-flex-wrap">
                   <span className="mr-mr-1">
                     <FormattedMessage {...messages.find} />
                   </span>
                   <FormattedMessage {...messages.somethingNew} />
                 </div>
                 <div>
                   <Link to="/browse/challenges" className="mr-button">
                     <FormattedMessage {...messages.findChallengeLabel} />
                   </Link>
                 </div>
               </div>
             </React.Fragment> :
             <Link to="/browse/challenges" className="mr-button">
               <FormattedMessage {...messages.findChallengeLabel} />
             </Link>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

DashboardHeader.propTypes = {
  user: PropTypes.object.isRequired,
  taskMetrics: PropTypes.object,
  leaderboardMetrics: PropTypes.object,
}

export default DashboardHeader