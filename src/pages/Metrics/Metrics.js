import React, { Component } from 'react'
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import SignInButton from '../../components/SignInButton/SignInButton'
import SvgSymbol from '../../components/SvgSymbol/SvgSymbol'
import WithStatus from '../../components/HOCs/WithStatus/WithStatus'
import WithTargetUser from '../../components/HOCs/WithTargetUser/WithTargetUser'
import WithUserMetrics from '../../components/HOCs/WithUserMetrics/WithUserMetrics'
import ReviewStats from './blocks/ReviewStats'
import TaskStats from './blocks/TaskStats'
import LeaderboardStats from './blocks/LeaderboardStats'
import _map from 'lodash/map'
import _get from 'lodash/get'
import AsAvatarUser from '../../interactions/User/AsAvatarUser'
import messages from './Messages'
import messagesAsReviewer from './MessagesAsReviewer'

const ProfileImage = props => {

  const osmProfile = AsAvatarUser(props.targetUser.osmProfile)

  return (
    <img
      className="mr-block mr-mx-auto mr-w-32 mr-h-32 mr-rounded-full mr-mb-4"
      src={osmProfile.profilePic(128)}
      srcSet={`${osmProfile.profilePic(128)} 1x, ${osmProfile.profilePic(256)} 2x"`}
      alt={osmProfile.displayName}
    />
  )
}

class Metrics extends Component {
  componentDidMount() {
    // Make sure our user info is current
    if (_get(this.props, 'targetUser.isLoggedIn')) {
      this.props.loadCompleteUser(this.props.targetUser.id)
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.targetUser && this.props.targetUser.id !== _get(prevProps, 'targetUser.id')) {
      // if (this.props.targetUser.isLoggedIn) {
      //   this.props.loadCompleteUser(this.props.targetUser.id)
      // }
    }
  }

  digitBoxes = (score, minBoxes=4) => {
    const digits = score.toString().split('')
    const totalBoxes = minBoxes > digits.length ? minBoxes : digits.length
    const boxes = _map(digits, (digit, index) =>
      <span key={totalBoxes - index}>{digit}</span>)

    while (boxes.length < minBoxes) {
      boxes.unshift(<span key={totalBoxes - boxes.length}>&nbsp;</span>)
    }

    return boxes
  }

  render() {
    if (!this.props.targetUser) {
      if (this.props.loading) {
        return (
          <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-gradient-r-green-dark-blue">
            <BusySpinner />
          </div>
        )
      }
      else {
        return (
          <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-gradient-r-green-dark-blue">
            {this.props.checkingLoginStatus ? (
              <BusySpinner />
            ) : (
              <SignInButton {...this.props} longForm />
            )}
          </div>
        )
      }
    }

    const totalTasks = _get(this.props.taskMetrics, 'total') || 0

    const optedOut = _get(this.props.targetUser, 'settings.leaderboardOptOut') &&
                          _get(this.props, 'targetUser.id') !== _get(this.props, 'currentUser.userId')
    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-py-6">
        <div className="mr-bg-world-map mr-bg-top mr-bg-no-repeat mr-px-6 md:mr-py-8 mr-min-h-screen">
          <div className="mr-max-w-xl mr-mx-auto mr-cards-inverse">
            <header className="mr-text-center mr-mb-4 md:mr-mb-8">
              <ProfileImage {...this.props} user={this.props.targetUser} />
              <h1 className="mr-h3 mr-mb-1">
                {this.props.targetUser.osmProfile.displayName}
              </h1>
              <p className="mr-text-grey-light mr-text-sm mr-font-mono">
                <FormattedMessage {...messages.userSince} />{' '}
                <FormattedDate
                  month="long"
                  year="numeric"
                  value={new Date(this.props.targetUser.created)}
                />
              </p>
            </header>
            {optedOut ?
              <h3 className="mr-text-center mr-text-yellow mr-mt-8">
                <FormattedMessage {...messages.userOptedOut} />
              </h3>
              :
              <React.Fragment>
              <div className="mr-mb-4 md:mr-mb-8 md:mr-grid md:mr-grid-gap-8 md:mr-grid-columns-2">
                <div className="mr-mb-4 md:mr-mb-0 mr-p-8 mr-bg-blue mr-rounded mr-shadow mr-flex mr-items-center">
                  {!this.props.taskMetrics ?
                    <div className="mr-flex-grow mr-text-center"><BusySpinner /></div> :
                    <div className="mr-flex-grow mr-text-center">
                      <div className="mr-mb-4">
                        <SvgSymbol
                          sym="illustration-completed-tasks"
                          className="mr-w-32 mr-h-auto"
                          viewBox="0 0 183 120"
                        />
                      </div>
                      <span className="mr-ticker mr-mb-6 mr-text-5xl lg:mr-text-6xl">
                        {this.digitBoxes(totalTasks, 4)}
                      </span>
                      <h3 className="mr-h3">
                        <FormattedMessage {...messages.totalCompletedTasksTitle} />
                      </h3>
                    </div>
                  }
                </div>
                <ReviewStats {...this.props}
                  messages={messages}
                  title={this.props.intl.formatMessage(messages.reviewedTasksTitle)}
                  tasksMonthsPast={this.props.tasksReviewedMonthsPast}
                  setTasksMonthsPast={this.props.setTasksReviewedMonthsPast}
                />
              </div>
              <div className="md:mr-grid md:mr-grid-gap-8 md:mr-grid-columns-3">
                <TaskStats {...this.props} />
                <LeaderboardStats {...this.props} />
              </div>
              {this.props.reviewerMetrics && false &&
                <div className="mr-mt-8">
                  <ReviewStats {...this.props}
                    reviewMetrics={this.props.reviewerMetrics}
                    tasksMonthsPast={this.props.tasksReviewerMonthsPast}
                    setTasksMonthsPast={this.props.setTasksReviewerMonthsPast}
                    messages={messagesAsReviewer}
                    title={
                      this.props.targetUser.id !== _get(this.props.user, 'id') ?
                      this.props.intl.formatMessage(
                        messagesAsReviewer.reviewerTitle, {username: this.props.targetUser.name}) :
                      this.props.intl.formatMessage(messagesAsReviewer.reviewerTitleYou)
                    }/>
                </div>
              }
              </React.Fragment>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default WithStatus(WithTargetUser(WithUserMetrics(injectIntl(Metrics)), false))
