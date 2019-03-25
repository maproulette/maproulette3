import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import { fetchReviewNeededTasks }
       from '../../../services/Task/TaskReview/TaskReviewNeeded'
import { fetchReviewedTasks }
       from '../../../services/Task/TaskReview/TaskReviewed'

const DEFAULT_PAGE_SIZE = 5

/**
 * WithReviewTasks retrieves tasks that need to be Reviewed
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithReviewTasks = function(WrappedComponent, reviewStatus=0) {
  return class extends Component {
    state = {
      loading: false
    }

    refresh = () => {
      this.update(this.props)
    }

    update(props) {
      this.setState({loading: true})
      if (props.asReviewer) {
        if (props.showReviewedByMe) {
          props.updateUserReviewedTasks().then(() => {
            this.setState({loading: false})
          })
        }
        else {
          props.updateReviewNeededTasks().then(() => {
            this.setState({loading: false})
          })
        }
      }
      else {
        props.updateReviewedTasks().then(() => {
          this.setState({loading: false})
        })
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
                          updateReviewTasks={updateTasks}
                          defaultPageSize={DEFAULT_PAGE_SIZE}
                          refresh={this.refresh}
                          loading={this.state.loading}
                          {..._omit(this.props, ['updateReviewTasks'])} />)
    }
  }
}

const mapStateToProps = state => ({
  reviewNeededTasks: _get(state, 'currentReviewTasks.reviewNeeded.tasks', []),
  reviewNeededTasksCount: _get(state, 'currentReviewTasks.reviewNeeded.totalCount', 0),

  reviewedTasksByMe: _get(state, 'currentReviewTasks.reviewedByUser.tasks', []),
  reviewedTasksByMeCount: _get(state, 'currentReviewTasks.reviewedByUser.totalCount', 0),

  reviewedTasks: _get(state, 'currentReviewTasks.reviewed.tasks', []),
  reviewedTasksCount: _get(state, 'currentReviewTasks.reviewed.totalCount', 0),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateReviewNeededTasks: (searchCriteria={}, pageSize=DEFAULT_PAGE_SIZE) => {
    return dispatch(fetchReviewNeededTasks(searchCriteria, pageSize))
  },
  updateReviewedTasks: (searchCriteria={}, pageSize=DEFAULT_PAGE_SIZE) => {
    return dispatch(fetchReviewedTasks(searchCriteria, false, pageSize))
  },
  updateUserReviewedTasks: (searchCriteria={}, pageSize=DEFAULT_PAGE_SIZE) => {
    return dispatch(fetchReviewedTasks(searchCriteria, true, pageSize))
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithReviewTasks(WrappedComponent))
