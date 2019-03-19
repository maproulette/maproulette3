import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import { fetchReviewNeededTasks }
       from '../../../services/Task/TaskReview/TaskReviewNeeded'
import { fetchReviewedTasks }
       from '../../../services/Task/TaskReview/TaskReviewed'
import { loadNextReviewTask } from '../../../services/Task/Task'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'


const DEFAULT_PAGE_SIZE = 20

/**
 * WithReviewTasks retrieves tasks that need to be Reviewed
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithReviewTasks = function(WrappedComponent, reviewStatus=0) {
  return class extends Component {
    refresh = (sortBy, direction, filters) => {
      this.update(this.props, sortBy, direction, filters)
    }

    update(props, sortBy, direction, filters) {
      if (props.asReviewer) {
        if (props.showReviewedByMe) {
          props.updateUserReviewedTasks({sortCriteria: {sortBy, direction}, filters}).then(() => {
          })
        }
        else {
          props.updateReviewNeededTasks({sortCriteria: {sortBy, direction}, filters}).then(() => {
          })
        }
      }
      else {
        props.updateReviewedTasks({sortCriteria: {sortBy, direction}, filters}).then(() => {
        })
      }
    }

    componentDidMount() {
      this.update(this.props)
    }

    render() {
      let reviewData = this.props.currentReviewTasks.reviewed
      let updateTasks = this.props.updateReviewedTasks

      if (this.props.asReviewer) {
        reviewData = this.props.currentReviewTasks.reviewNeeded
        updateTasks = this.props.updateReviewNeededTasks

        if (this.props.showReviewedByMe) {
          reviewData = this.props.currentReviewTasks.reviewedByUser
          updateTasks = this.props.updateUserReviewedTasks
        }
      }

      return (
        <WrappedComponent reviewData = {reviewData}
                          updateReviewTasks={updateTasks}
                          defaultPageSize={DEFAULT_PAGE_SIZE}
                          refresh={this.refresh}
                          startReviewing={this.props.startNextReviewTask}
                          {..._omit(this.props, ['updateReviewTasks'])} />)
    }
  }
}

const mapStateToProps = state => ({ currentReviewTasks: state.currentReviewTasks })

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

  startNextReviewTask: (sortBy, direction, filters, url) => {
    dispatch(loadNextReviewTask({sortCriteria: {sortBy, direction}, filters})).then((task) => {
      url.push(`/challenge/${task.parent}/task/${task.id}/review`)
    }).catch(error => {
      console.log(error)
      dispatch(addError(AppErrors.reviewTask.fetchFailure))
      url.push('/review')
    })
  }

})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithReviewTasks(WrappedComponent))
