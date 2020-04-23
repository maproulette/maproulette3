import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _values from 'lodash/values'
import _cloneDeep from 'lodash/cloneDeep'
import { fetchReviewChallenges, ReviewTasksType } from '../../../services/Task/TaskReview/TaskReview'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'

/**
 * WithReviewChallenges - Will fetch a list of challenges and projects
 * associated with reviews
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
 export const WithReviewChallenges = function(WrappedComponent) {
   class _WithReviewChallenges extends Component {
     state = {
       reviewChallenges: {},
     }

     /**
      * Kick off loading of challenges that have review tasks
      *
      * @private
      */
     updateReviewChallenges = (reviewTasksType) => {
       const reviewChallenges = _cloneDeep(this.state.reviewChallenges)
       reviewChallenges[reviewTasksType] = {loading: true}
       this.setState({reviewChallenges})

       const includeStatuses =
         reviewTasksType === ReviewTasksType.toBeReviewed ?
           [TaskStatus.fixed] : null

       this.props.fetchReviewChallenges(reviewTasksType, includeStatuses, true).then(challenges => {
         const loadedChallenges = _cloneDeep(this.state.reviewChallenges)
         loadedChallenges[reviewTasksType] = {
           loading: true,
           challenges: _values(_get(challenges, 'entities.challenges')),
           projects: _values(_get(challenges, 'entities.projects'))
         }

         this.setState({reviewChallenges: loadedChallenges})
       })
     }

     componentDidMount() {
       this.updateReviewChallenges(this.props.reviewTasksType)
     }

     componentDidUpdate(prevProps) {
       const reviewTasksType = this.props.reviewTasksType
       if (this.state.reviewChallenges[reviewTasksType] &&
          !this.state.reviewChallenges[reviewTasksType].loading) {
         this.updateReviewChallenges(reviewTasksType)
       }
       else if (reviewTasksType !== prevProps.reviewTasksType) {
         this.updateReviewChallenges(reviewTasksType)
       }
     }

     render() {
       return (
         <WrappedComponent
           {..._omit(this.props, ['fetchReviewChallenges'])}
           challenges={_get(this.state.reviewChallenges[this.props.reviewTasksType], 'challenges')}
           projects={_get(this.state.reviewChallenges[this.props.reviewTasksType], 'projects')}
         />
       )
     }
   }

   _WithReviewChallenges.propTypes = {
     fetchReviewChallenges: PropTypes.func.isRequired,
   }

   return _WithReviewChallenges
 }

 export const mapDispatchToProps =
   dispatch => bindActionCreators({ fetchReviewChallenges }, dispatch)

 export default WrappedComponent =>
   connect(null, mapDispatchToProps)(WithReviewChallenges(WrappedComponent))
