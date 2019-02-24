import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _debounce from 'lodash/debounce'
import { fetchReviewNeededTasks } from '../../../services/Task/TaskReview/TaskReviewNeeded'
import { fetchReviewedTasks } from '../../../services/Task/TaskReview/TaskReviewed'

const DEFAULT_PAGE_SIZE = 5

/**
 * WithReviewTasks retrieves tasks that need to be Reviewed
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithReviewTasks = function(WrappedComponent, reviewStatus=0) {
  return class extends Component {
    update(props) {
      if (props.asReviewer) {
        if (props.showReviewedByMe) {
          props.updateUserReviewedTasks()
        }
        else {
          props.updateReviewNeededTasks()
        }
      }
      else {
        props.updateReviewedTasks()
      }
    }

    componentDidMount() {
      this.update(this.props)
    }

    render() {
      var reviewTasks = this.props.reviewedTasks
      var updateTasks = this.props.updateReviewedTasks
      var totalCount = this.props.reviewedTasksCount

      if ( this.props.asReviewer ) {
        reviewTasks = this.props.reviewNeededTasks
        updateTasks = this.props.updateReviewNeededTasks
        totalCount = this.props.reviewNeededTasksCount

        if (this.props.showReviewedByMe) {
          reviewTasks = this.props.reviewedTasksByMe
          updateTasks = this.props.updateUserReviewedTasks
          totalCount = this.props.reviewedTasksByMeCount
        }
      }

      return (
        <WrappedComponent reviewTasks={reviewTasks}
                          totalCount={totalCount}
                          updateReviewTasks={_debounce(updateTasks, 1000, {leading: false})}
                          defaultPageSize={DEFAULT_PAGE_SIZE}
                          {..._omit(this.props, ['updateReviewTasks'])} />)
    }
  }
}

const mapStateToProps = state => ({
  reviewNeededTasks: _get(state, 'currentReviewNeededTasks.tasks', []),
  reviewNeededTasksCount: _get(state, 'currentReviewNeededTasks.totalCount', 0),

  reviewedTasksByMe: _get(state, 'currentReviewedByUserTasks.tasks', []),
  reviewedTasksByMeCount: _get(state, 'currentReviewedByUserTasks.totalCount', 0),

  reviewedTasks: _get(state, 'currentReviewedTasks.tasks', []),
  reviewedTasksCount: _get(state, 'currentReviewedTasks.totalCount', 0),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateReviewNeededTasks: (searchCriteria={}, pageSize=DEFAULT_PAGE_SIZE) => {
    dispatch(fetchReviewNeededTasks(searchCriteria, pageSize))
  },
  updateReviewedTasks: (searchCriteria={}, pageSize=DEFAULT_PAGE_SIZE) => {
    dispatch(fetchReviewedTasks(searchCriteria, false, pageSize))
  },
  updateUserReviewedTasks: (searchCriteria={}, pageSize=DEFAULT_PAGE_SIZE) => {
    dispatch(fetchReviewedTasks(searchCriteria, true, pageSize))
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithReviewTasks(WrappedComponent))
