import { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import { fetchReviewMetrics }
       from '../../../services/Task/TaskReview/TaskReview'
import WithCurrentUser from '../WithCurrentUser/WithCurrentUser'

/**
 * WithReviewMetrics retrieves metrics for the currently filtered review tasks
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithReviewMetrics = function(WrappedComponent) {
  return class extends Component {
    state = {
      updateAvailable: true,
      loading: false,
    }

    updateMetrics(props) {
      this.setState({updateAvailable: false, loading: true})

      props.updateReviewMetrics(_get(props.user, 'id'),
                                props.reviewTasksType,
                                props.reviewCriteria).then(() => {
        this.setState({loading: false})
      })
    }

    componentDidUpdate(prevProps) {
      if (this.state.updateAvailable) {
        return // nothing to do
      }

      if (prevProps.reviewTasksType !== this.props.reviewTasksType) {
        this.setState({updateAvailable: true})
      }
      else if (prevProps.reviewCriteria !== this.props.reviewCriteria) {
        this.setState({updateAvailable: true})
      }
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ['updateReviewMetrics'])}
          reviewMetrics = {this.props.reviewMetrics}
          reviewMetricsByPriority = {this.props.reviewMetricsByPriority}
          reviewMetricsByTaskStatus = {this.props.reviewMetricsByTaskStatus}
          metricsUpdateAvailable = {this.state.updateAvailable}
          refreshMetrics = {() => this.updateMetrics(this.props)}
          loading={this.state.loading}
        />
      )
    }
  }
}

const mapStateToProps = state => {
  return ({ reviewMetrics: _get(state, 'currentReviewTasks.metrics.reviewActions'),
            reviewMetricsByPriority: _get(state, 'currentReviewTasks.metrics.priorityReviewActions'),
            reviewMetricsByTaskStatus: _get(state, 'currentReviewTasks.metrics.statusReviewActions') })
}

const mapDispatchToProps = (dispatch) => ({
  updateReviewMetrics: (userId, reviewTasksType, searchCriteria={}) => {
    return dispatch(fetchReviewMetrics(userId, reviewTasksType, searchCriteria))
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(WithReviewMetrics(WrappedComponent)))
