import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { injectIntl } from 'react-intl'
import MediaQuery from 'react-responsive'
import classNames from 'classnames'
import _cloneDeep from 'lodash/cloneDeep'
import AsEndUser from '../../interactions/User/AsEndUser'
import WithCurrentUser from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import WithWebSocketSubscriptions
       from '../../components/HOCs/WithWebSocketSubscriptions/WithWebSocketSubscriptions'
import ScreenTooNarrow from '../../components/ScreenTooNarrow/ScreenTooNarrow'
import SignInButton from '../../components/SignInButton/SignInButton'
import Header from '../../components/Header/Header'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../services/Widget/Widget'
import WithWidgetWorkspaces
       from '../../components/HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import WidgetWorkspace from '../../components/WidgetWorkspace/WidgetWorkspace'
import { ReviewTasksType } from '../../services/Task/TaskReview/TaskReview'
import WithReviewTasks from '../../components/HOCs/WithReviewTasks/WithReviewTasks'
import WithReviewMetrics from '../../components/HOCs/WithReviewMetrics/WithReviewMetrics'
import TasksReviewChallenges from './TasksReview/TasksReviewChallenges'
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
    showType: ReviewTasksType.toBeReviewed,
    filterSelected: {},
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

  setSelectedChallenge = (challengeId, challengeName) => {
    const filterSelected = _cloneDeep(this.state.filterSelected)
    filterSelected[this.state.showType] = filterSelected[this.state.showType] || {}
    filterSelected[this.state.showType].challengeId = challengeId
    filterSelected[this.state.showType].challenge = challengeName
    this.setState({filterSelected})
  }

  setSelectedProject = (projectId, projectName) => {
    const filterSelected = _cloneDeep(this.state.filterSelected)
    filterSelected[this.state.showType] = filterSelected[this.state.showType] || {}
    filterSelected[this.state.showType].projectId = projectId
    filterSelected[this.state.showType].project = projectName
    this.setState({filterSelected})
  }

  changeTab = (tab) => {
    const filterSelected = _cloneDeep(this.state.filterSelected)
    filterSelected[this.state.showType] = null
    this.setState({showType: tab, filterSelected})
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
          <button
            className={classNames(
              this.state.showType === 'tasksToBeReviewed' ? "mr-text-white" : "mr-text-green-lighter"
            )}
            onClick={() => this.changeTab(ReviewTasksType.toBeReviewed)}
          >
            {this.props.intl.formatMessage(messages.tasksToBeReviewed)}
          </button>
        </li>
        <li className="mr-ml-4 mr-border-l mr-pl-4 mr-border-green">
          <button
            className={classNames(
              this.state.showType === ReviewTasksType.reviewedByMe ? "mr-text-white" : "mr-text-green-lighter"
            )}
            onClick={() => this.changeTab(ReviewTasksType.reviewedByMe)}
          >
            {this.props.intl.formatMessage(messages.tasksReviewedByMe)}
          </button>
        </li>
        <li className="mr-ml-4 mr-border-l mr-pl-4 mr-border-green">
          <button
            className={classNames(
              this.state.showType === ReviewTasksType.myReviewedTasks ? "mr-text-white" : "mr-text-green-lighter"
            )}
            onClick={() => this.changeTab(ReviewTasksType.myReviewedTasks)}
          >
            {this.props.intl.formatMessage(messages.myReviewTasks)}
          </button>
        </li>
        <li className="mr-ml-4 mr-border-l mr-pl-4 mr-border-green">
          <button
            className={classNames(
              this.state.showType === ReviewTasksType.allReviewedTasks ? "mr-text-current" : "mr-text-green-lighter"
            )}
            onClick={() => this.changeTab(ReviewTasksType.allReviewedTasks)}
          >
            {this.props.intl.formatMessage(messages.allReviewedTasks)}
          </button>
        </li>
      </ol>

    const notReviewerTabs = (
      <div>
        <ol className="mr-list-reset mr-text-md mr-leading-tight mr-flex mr-links-green-lighter">
          <li>
            {this.props.intl.formatMessage(messages.myReviewTasks)}
          </li>
          <li className="mr-ml-4 mr-border-l mr-pl-4 mr-border-green">
            <Link to="/user/profile">
              {this.props.intl.formatMessage(messages.volunteerAsReviewer)}
            </Link>
          </li>
        </ol>
      </div>
    )

    return (
      <div className='review-pane'>
        <MediaQuery query="(max-width: 1023px)">
          <ScreenTooNarrow />
        </MediaQuery>

        <MediaQuery query="(min-width: 1024px)">
          {!this.state.filterSelected[showType] &&
            <div className={classNames("mr-widget-workspace",
              "mr-py-8 mr-bg-gradient-r-green-dark-blue mr-text-white mr-cards-inverse")}>
              <Header
                className="mr-px-8"
                eyebrow={this.props.workspaceEyebrow}
                title={''}
                info={user.isReviewer()? reviewerTabs : notReviewerTabs}
                actions={null}
              />
              <div>
                <TasksReviewChallenges
                  reviewTasksType={this.state.showType}
                  selectChallenge={this.setSelectedChallenge}
                  selectProject={this.setSelectedProject}
                />
              </div>
            </div>
          }
          {this.state.filterSelected[showType] &&
            <ReviewWidgetWorkspace
              {...this.props}
              className="mr-py-8 mr-bg-gradient-r-green-dark-blue mr-text-white mr-cards-inverse"
              workspaceTitle={null}
              workspaceInfo={user.isReviewer()? reviewerTabs : notReviewerTabs}
              reviewTasksType={showType}
              defaultFilters={this.state.filterSelected[showType]}
            />
          }
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
