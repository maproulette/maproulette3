import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import { fetchReviewTagMetrics }
       from '../../../services/Task/TaskReview/TaskReview'
import WithCurrentUser from '../WithCurrentUser/WithCurrentUser'

/**
 * WithReviewTagMetrics retrieves tag metrics for the currently filtered review tasks
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithReviewTagMetrics = function(WrappedComponent) {
  return class extends Component {
    state = {
      loading: false
    }

    updateMetrics(props) {
      this.setState({loading: true})

      props.updateReviewTagMetrics(_get(props.user, 'id'),
                                   props.reviewTasksType,
                                   props.reviewCriteria).then(() => {
        this.setState({loading: false})
      })
    }

    componentDidMount() {
      this.updateMetrics(this.props)
    }

    componentDidUpdate(prevProps) {
      if (prevProps.reviewTasksType !== this.props.reviewTasksType ||
          prevProps.reviewCriteria !== this.props.reviewCriteria) {
        this.updateMetrics(this.props)
      }
    }

    render() {
      const totalTasks = _get(this.props.reviewData, 'totalCount', 0)
      return (
        <WrappedComponent tagMetrics = {this.props.reviewTagMetrics}
                          totalTasks = {totalTasks}
                          loading={this.state.loading}
                          {..._omit(this.props, ['updateReviewTagMetrics'])} />)
    }
  }
}

const mapStateToProps = state => {
  return ({ reviewTagMetrics: _get(state, 'currentReviewTasks.tagMetrics'), })
}

const mapDispatchToProps = (dispatch) => ({
  updateReviewTagMetrics: (userId, reviewTasksType, searchCriteria={}) => {
    return dispatch(fetchReviewTagMetrics(userId, reviewTasksType, searchCriteria))
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(WithReviewTagMetrics(WrappedComponent)))
