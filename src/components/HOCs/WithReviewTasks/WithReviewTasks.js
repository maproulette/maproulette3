import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _cloneDeep from 'lodash/cloneDeep'
import _isString from 'lodash/isString'
import _isUndefined from 'lodash/isUndefined'
import { ReviewTasksType } from '../../../services/Task/TaskReview/TaskReview'
import { fetchReviewNeededTasks }
       from '../../../services/Task/TaskReview/TaskReviewNeeded'
import { fetchReviewedTasks }
       from '../../../services/Task/TaskReview/TaskReviewed'
import { loadNextReviewTask } from '../../../services/Task/TaskReview/TaskReview'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'


const DEFAULT_PAGE_SIZE = 20
const DEFAULT_CRITERIA = {sortCriteria: {sortBy: 'mapped_on', direction: 'ASC'}}

/**
 * WithReviewTasks retrieves tasks that need to be Reviewed
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithReviewTasks = function(WrappedComponent, reviewStatus=0) {
  return class extends Component {
    state = {
      loading: false,
      criteria: {},
      pageSize: DEFAULT_PAGE_SIZE,
    }

    refresh = () => {
      this.update(this.props, this.state.criteria[this.props.reviewTasksType])
    }

    update(props, criteria, pageSize) {
      if (!pageSize) {
        pageSize = this.state.pageSize
      }

      if (_isUndefined(criteria.savedChallengesOnly)) {
        criteria.savedChallengesOnly = _get(this.state.criteria[this.props.reviewTasksType], "savedChallengesOnly")
      }

      const typedCriteria = _cloneDeep(this.state.criteria)
      typedCriteria[props.reviewTasksType] = criteria
      this.setState({loading: true, criteria: typedCriteria, pageSize})

      switch(props.reviewTasksType) {
        case ReviewTasksType.reviewedByMe:
          return props.updateUserReviewedTasks(criteria, pageSize).then(() => {
            this.setState({loading: false})
          })
        case ReviewTasksType.toBeReviewed:
          return props.updateReviewNeededTasks(criteria, pageSize).then(() => {
            this.setState({loading: false})
          })
        case ReviewTasksType.myReviewedTasks:
        default:
          return props.updateReviewedTasks(criteria, pageSize).then(() => {
            this.setState({loading: false})
          })
      }
    }

    componentDidMount() {
      const searchParams = this.props.history.location.state
      let pageSize = _get(searchParams, 'pageSize') || DEFAULT_PAGE_SIZE

      const criteria = buildSearchCrteria(searchParams)
      const stateCriteria = this.state.criteria
      stateCriteria[this.props.reviewTasksType] = criteria
      this.setState({criteria: stateCriteria, pageSize})
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevProps.reviewTasksType !== this.props.reviewTasksType) {
        this.update(this.props, this.state.criteria[this.props.reviewTasksType] || DEFAULT_CRITERIA)
      }
    }

    render() {
      let reviewData = null

      switch(this.props.reviewTasksType) {
        case ReviewTasksType.reviewedByMe:
          reviewData = this.props.currentReviewTasks.reviewedByUser
          break
        case ReviewTasksType.toBeReviewed:
          reviewData = this.props.currentReviewTasks.reviewNeeded
          break
        case ReviewTasksType.myReviewedTasks:
        default:
          reviewData = this.props.currentReviewTasks.reviewed
          break
      }

      const criteria = this.state.criteria[this.props.reviewTasksType] || DEFAULT_CRITERIA
      return (
        <WrappedComponent reviewData={reviewData}
                          updateReviewTasks={(criteria, pageSize) => this.update(this.props, criteria, pageSize)}
                          refresh={this.refresh}
                          reviewCriteria={criteria}
                          pageSize={this.state.pageSize}
                          startReviewing={(url) => this.props.startNextReviewTask(criteria, url)}
                          loading={this.state.loading}
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

  startNextReviewTask: (searchCriteria={}, url) => {
    dispatch(loadNextReviewTask(searchCriteria)).then((task) => {
      url.push(`/challenge/${task.parent}/task/${task.id}/review`, searchCriteria)
    }).catch(error => {
      console.log(error)
      dispatch(addError(AppErrors.reviewTask.fetchFailure))
      url.push('/review', searchCriteria)
    })
  }

})

function buildSearchCrteria(searchParams) {
  if (searchParams) {
    let sortBy = _get(searchParams, 'sortBy')
    let direction = _get(searchParams, 'direction')
    let filters = _get(searchParams, 'filters', {})
    const page = _get(searchParams, 'page')
    const boundingBox = searchParams.boundingBox
    const savedChallengesOnly = searchParams.savedChallengesOnly

    if (_isString(filters)) {
      filters = JSON.parse(searchParams.filters)
    }

    if (searchParams.sortCriteria) {
      sortBy = _get(searchParams, 'sortCriteria.sortBy')
      direction = _get(searchParams, 'sortCriteria.direction')
    }

    return {sortCriteria: {sortBy, direction}, filters, page, boundingBox, savedChallengesOnly}
  }
  else return DEFAULT_CRITERIA
}

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithReviewTasks(WrappedComponent))
