import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'

import MediaQuery from 'react-responsive'
import AsEndUser from '../../interactions/User/AsEndUser'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import ScreenTooNarrow from '../ScreenTooNarrow/ScreenTooNarrow'
import TasksReviewTable from './TasksReview/TasksReviewTable'
import SignInButton from '../SignInButton/SignInButton'
import WithReviewTasks from '../HOCs/WithReviewTasks/WithReviewTasks'
import './ReviewTasksDashboard.scss'


const TasksTable = WithReviewTasks(TasksReviewTable)

/**
 * ReviewTasksDashboard is the top-level component for viewing tasks
 * that need to be reviewed or have been reviewed.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ReviewTasksDashboard extends Component {
  render() {
    // The user needs to be logged in.
    const user = AsEndUser(this.props.user)
    if (!user.isLoggedIn()) {
      return (
        <div className="review">
          <SignInButton {...this.props} />
        </div>
      )
    }

    return (
      <React.Fragment>
        <MediaQuery query="(max-width: 1023px)">
          <ScreenTooNarrow />
        </MediaQuery>

        <MediaQuery query="(min-width: 1024px)">
          <div className="review mr-bg-gradient-r-green-dark-blue mr-text-white">
            <div className="review-pane">
              <h1>Reviewer/Mapper Stuff</h1>
              {user.needsReview() && <TasksTable {...this.props} />}
              {user.isReviewer() && <TasksTable {...this.props} asReviewer />}
              {user.isReviewer() && <TasksTable {...this.props} asReviewer showReviewedByMe />}
            </div>
          </div>
        </MediaQuery>
      </React.Fragment>
    )
  }
}

ReviewTasksDashboard.propTypes = {
  /** router location */
  location: PropTypes.object.isRequired,
}

export default WithCurrentUser(injectIntl(ReviewTasksDashboard))
