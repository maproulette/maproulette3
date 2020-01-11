import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _cloneDeep from 'lodash/cloneDeep'
import _isUndefined from 'lodash/isUndefined'
import WithCurrentUser from '../WithCurrentUser/WithCurrentUser'
import { ReviewTasksType } from '../../../services/Task/TaskReview/TaskReview'
import { fetchReviewNeededTasks }
       from '../../../services/Task/TaskReview/TaskReviewNeeded'
import { fetchReviewedTasks }
       from '../../../services/Task/TaskReview/TaskReviewed'
import { loadNextReviewTask } from '../../../services/Task/TaskReview/TaskReview'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'
import { buildSearchCriteria } from '../../../services/SearchCriteria/SearchCriteria'


const DEFAULT_PAGE_SIZE = 20
const DEFAULT_CRITERIA = {sortCriteria: {sortBy: 'mappedOn', direction: 'ASC'}, pageSize: DEFAULT_PAGE_SIZE}

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

    changePageSize = (pageSize) => {
      const typedCriteria = _cloneDeep(this.state.criteria)
      typedCriteria[this.props.reviewTasksType].pageSize = pageSize
      this.setState({criteria: typedCriteria})
    }

    setFiltered = (column, value) => {
      const typedCriteria = _cloneDeep(this.state.criteria)
      typedCriteria[this.props.reviewTasksType].filters[column] = value
      this.setState({criteria: typedCriteria})
    }

    update(props, criteria) {
      const userId = _get(props, 'user.id')
      const pageSize = _get(this.state.criteria[props.reviewTasksType], 'pageSize') || DEFAULT_PAGE_SIZE

      if (_isUndefined(criteria.savedChallengesOnly)) {
        criteria.savedChallengesOnly = _get(this.state.criteria[this.props.reviewTasksType], "savedChallengesOnly")
      }
      if (_isUndefined(criteria.excludeOtherReviewers)) {
        criteria.excludeOtherReviewers = _get(this.state.criteria[this.props.reviewTasksType], "excludeOtherReviewers")
      }

      const typedCriteria = _cloneDeep(this.state.criteria)
      typedCriteria[props.reviewTasksType] = criteria
      typedCriteria[props.reviewTasksType].pageSize = pageSize

      this.setState({loading: true, criteria: typedCriteria})

      switch(props.reviewTasksType) {
        case ReviewTasksType.reviewedByMe:
          return props.updateUserReviewedTasks(userId, criteria, pageSize).then(() => {
            this.setState({loading: false})
          })
        case ReviewTasksType.toBeReviewed:
          return props.updateReviewNeededTasks(criteria, pageSize).then(() => {
            this.setState({loading: false})
          })
        case ReviewTasksType.allReviewedTasks:
          return props.updateReviewedTasks(userId, criteria, pageSize).then(() => {
            this.setState({loading: false})
          })
        case ReviewTasksType.myReviewedTasks:
        default:
          return props.updateMapperReviewedTasks(userId, criteria, pageSize).then(() => {
            this.setState({loading: false})
          })
      }
    }

    componentDidMount() {
      const searchParams = this.props.history.location.state
      let pageSize = _get(searchParams, 'pageSize') || DEFAULT_PAGE_SIZE

      const criteria = buildSearchCriteria(searchParams, DEFAULT_CRITERIA)
      criteria.pageSize = pageSize

      const stateCriteria = this.state.criteria
      stateCriteria[this.props.reviewTasksType] = criteria
      this.setState({criteria: stateCriteria})
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
        case ReviewTasksType.allReviewedTasks:
          reviewData = this.props.currentReviewTasks.reviewed
          break
        case ReviewTasksType.myReviewedTasks:
        default:
          reviewData = this.props.currentReviewTasks.mapperReviewed
          break
      }

      const criteria = this.state.criteria[this.props.reviewTasksType] || DEFAULT_CRITERIA
      return (
        <WrappedComponent reviewData={reviewData}
                          updateReviewTasks={(criteria) => this.update(this.props, criteria)}
                          refresh={this.refresh}
                          reviewCriteria={criteria}
                          pageSize={criteria.pageSize}
                          changePageSize={this.changePageSize}
                          setFiltered={this.setFiltered}
                          startReviewing={(url) => this.props.startNextReviewTask(criteria, url, criteria.pageSize)}
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
  updateReviewedTasks: (userId, searchCriteria={}, pageSize=DEFAULT_PAGE_SIZE) => {
    return dispatch(fetchReviewedTasks(userId, searchCriteria, false, false, pageSize))
  },
  updateMapperReviewedTasks: (userId, searchCriteria={}, pageSize=DEFAULT_PAGE_SIZE) => {
    return dispatch(fetchReviewedTasks(userId, searchCriteria, false, true, pageSize))
  },
  updateUserReviewedTasks: (userId, searchCriteria={}, pageSize=DEFAULT_PAGE_SIZE) => {
    return dispatch(fetchReviewedTasks(userId, searchCriteria, true, false, pageSize))
  },

  startNextReviewTask: (searchCriteria={}, url, pageSize) => {
    dispatch(loadNextReviewTask(searchCriteria)).then((task) => {
      const searchParams = _cloneDeep(searchCriteria)
      searchParams.pageSize = pageSize
      url.push(`/challenge/${task.parent}/task/${task.id}/review`, searchParams)
    }).catch(error => {
      console.log(error)
      dispatch(addError(AppErrors.reviewTask.fetchFailure))
      url.push('/review', searchCriteria)
    })
  }
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(WithReviewTasks(WrappedComponent)))
