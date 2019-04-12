import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import MediaQuery from 'react-responsive'
import AsEndUser from '../../interactions/User/AsEndUser'
import WithCurrentUser from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import WithReviewTasks from '../../components/HOCs/WithReviewTasks/WithReviewTasks'
import WithWebSocketSubscriptions
       from '../../components/HOCs/WithWebSocketSubscriptions/WithWebSocketSubscriptions'
import ScreenTooNarrow from '../../components/ScreenTooNarrow/ScreenTooNarrow'
import SignInButton from '../../components/SignInButton/SignInButton'
import TasksReviewTable from './TasksReview/TasksReviewTable'


const TasksTable = WithReviewTasks(TasksReviewTable)

/**
 * ReviewTasksDashboard is the top-level component for viewing tasks
 * that need to be reviewed or have been reviewed.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ReviewTasksDashboard extends Component {
  componentDidMount() {
    this.props.subscribeToReviewMessages()
  }

  componentWillUnmount() {
    this.props.unsubscribeFromReviewMessages()
  }

  render() {
    // The user needs to be logged in.
    const user = AsEndUser(this.props.user)
    if (!user.isLoggedIn()) {
      return (
        <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
          <SignInButton {...this.props} longForm />
        </div>
      )
    }

    return (
      <React.Fragment>
        <MediaQuery query="(max-width: 1023px)">
          <ScreenTooNarrow />
        </MediaQuery>

        <MediaQuery query="(min-width: 1024px)">
          <section className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-px-6 mr-py-8 md:mr-py-12 md:mr-px-12 mr-flex mr-flex-col mr-items-center">
            {user.isReviewer() && <TasksTable {...this.props} asReviewer />}
            {user.isReviewer() && <TasksTable {...this.props} asReviewer showReviewedByMe />}
            <TasksTable {...this.props} />
          </section>
        </MediaQuery>
      </React.Fragment>
    )
  }
}

ReviewTasksDashboard.propTypes = {
  /** router location */
  location: PropTypes.object.isRequired,
}

export default WithCurrentUser(WithWebSocketSubscriptions(injectIntl(ReviewTasksDashboard)))
