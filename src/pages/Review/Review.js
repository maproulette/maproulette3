import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import MediaQuery from 'react-responsive'
import classNames from 'classnames'
import AsEndUser from '../../interactions/User/AsEndUser'
import WithCurrentUser from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import WithWebSocketSubscriptions
       from '../../components/HOCs/WithWebSocketSubscriptions/WithWebSocketSubscriptions'
import ScreenTooNarrow from '../../components/ScreenTooNarrow/ScreenTooNarrow'
import SignInButton from '../../components/SignInButton/SignInButton'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../services/Widget/Widget'
import WithWidgetWorkspaces
       from '../../components/HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import WidgetWorkspace from '../../components/WidgetWorkspace/WidgetWorkspace'
import { ReviewTasksType } from '../../services/Task/TaskReview/TaskReview'
import WithReviewTasks from '../../components/HOCs/WithReviewTasks/WithReviewTasks'
import WithReviewMetrics from '../../components/HOCs/WithReviewMetrics/WithReviewMetrics'
import messages from './Messages'


const WIDGET_WORKSPACE_NAME = "reviewOverview"

const ReviewWidgetWorkspace = WithReviewTasks(WithReviewMetrics(WidgetWorkspace))

export const defaultWorkspaceSetup = function() {
  return {
    dataModelVersion: 2,
    name: WIDGET_WORKSPACE_NAME,
    label: "Review Overview",
    widgets: [
      widgetDescriptor('ReviewTableWidget'),
    ],
    layout: [
      {i: generateWidgetId(), x: 0, y: 0, w: 12, h: 18},
    ],
    excludeWidgets: []
  }
}

/**
 * ReviewTasksDashboard is the top-level component for viewing tasks
 * that need to be reviewed or have been reviewed.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ReviewTasksDashboard extends Component {
  state = {
    showType: ReviewTasksType.toBeReviewed
  }

  componentDidMount() {
    this.props.subscribeToReviewMessages()
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname &&
        this.props.location.search !== prevProps.location.search) {
      window.scrollTo(0, 0)
    }
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

    const showType = !user.isReviewer() ? ReviewTasksType.myReviewedTasks : this.state.showType

    const reviewerTabs =
      <ol className="mr-list-reset mr-text-md mr-leading-tight mr-flex">
        <li>
          <button className={classNames(this.state.showType === 'tasksToBeReviewed' ? "mr-text-green-lighter" : "mr-text-current")} onClick={() => this.setState({showType: ReviewTasksType.toBeReviewed})}>
            {this.props.intl.formatMessage(messages.tasksToBeReviewed)}
          </button>
        </li>
        <li className="mr-ml-4 mr-border-l mr-pl-4 mr-border-green">
          <button className={classNames(this.state.showType === ReviewTasksType.reviewedByMe ? "mr-text-green-lighter" : "mr-text-current")} onClick={() => this.setState({showType: ReviewTasksType.reviewedByMe})}>
            {this.props.intl.formatMessage(messages.tasksReviewedByMe)}
          </button>
        </li>
        <li className="mr-ml-4 mr-border-l mr-pl-4 mr-border-green">
          <button className={classNames(this.state.showType === ReviewTasksType.myReviewedTasks ? "mr-text-green-lighter" : "mr-text-current")} onClick={() => this.setState({showType: ReviewTasksType.myReviewedTasks})}>
            {this.props.intl.formatMessage(messages.myReviewTasks)}
          </button>
        </li>
        <li className="mr-ml-4 mr-border-l mr-pl-4 mr-border-green">
          <button className={classNames(this.state.showType === ReviewTasksType.allReviewedTasks ? "mr-text-green-lighter" : "mr-text-current")} onClick={() => this.setState({showType: ReviewTasksType.allReviewedTasks})}>
            {this.props.intl.formatMessage(messages.allReviewedTasks)}
          </button>
        </li>
      </ol>

    const notReviewerTabs =
      <ol className="mr-list-reset mr-text-md mr-leading-tight mr-flex">
        <li className="mr-text-green-lighter">
          {this.props.intl.formatMessage(messages.myReviewTasks)}
        </li>
      </ol>

    return (
      <div className='review-pane'>
        <MediaQuery query="(max-width: 1023px)">
          <ScreenTooNarrow />
        </MediaQuery>

        <MediaQuery query="(min-width: 1024px)">
          <ReviewWidgetWorkspace
            {...this.props}
            className="mr-py-8 mr-bg-gradient-r-green-dark-blue mr-text-white mr-cards-inverse"
            workspaceTitle={null}
            workspaceInfo={user.isReviewer()? reviewerTabs : notReviewerTabs}
            reviewTasksType={showType}
          />
        </MediaQuery>
      </div>
    )
  }
}

ReviewTasksDashboard.propTypes = {
  /** router location */
  location: PropTypes.object.isRequired,
}

export default
  WithCurrentUser(
    WithWebSocketSubscriptions(
      WithWidgetWorkspaces(
        injectIntl(ReviewTasksDashboard),
        WidgetDataTarget.review,
        WIDGET_WORKSPACE_NAME,
        defaultWorkspaceSetup
      )
    )
  )
