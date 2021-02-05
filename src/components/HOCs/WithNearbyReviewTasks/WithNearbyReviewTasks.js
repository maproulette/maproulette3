import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _isEqual from 'lodash/isEqual'
import { fetchNearbyReviewTasks } from '../../../services/Task/TaskReview/TaskReview'

/**
 * WithNearbyReviewTasks provides tasks geographically closest to the current task
 * to the wrapped component, utilizing the same object structure as
 * clusteredTasks for maximum interoperability
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithNearbyReviewTasks = function(WrappedComponent) {
  class _WithNearbyReviewTasks extends Component {
    state = {
      nearbyTasks: null,
      taskLimit: 5,
      hasMoreToLoad: true,
      lastLoadLength: 0,
    }

    /**
     * Kick off loading of review tasks geographically closest to the current task.
     * Note that this represents the nearby tasks (and loading status) using
     * the same data structure as clusteredTasks to promote map and HOC
     * interoperability
     *
     * @private
     */
    updateNearbyReviewTasks = props => {
      this.setState({nearbyTasks: {loading: true}})
      props.fetchNearbyReviewTasks(props.taskId, this.props.currentFilters, this.state.taskLimit,
                                   this.props.asMetaReview).then(nearbyTasks => {
        const tasksLength = nearbyTasks.tasks.length
        this.setState({nearbyTasks: {...nearbyTasks, nearTaskId: props.taskId, loading: false},
                       lastLoadLength: tasksLength,
                       hasMoreToLoad: (this.state.lastLoadLength !== tasksLength)})
      })
    }

    componentDidMount() {
      this.updateNearbyReviewTasks(this.props)
    }

    componentDidUpdate(prevProps, prevState) {
      if (this.state.nearbyTasks && !this.state.nearbyTasks.loading &&
          this.props.taskId !== this.state.nearbyTasks.nearTaskId) {
        return this.updateNearbyReviewTasks(this.props)
      }

      if (!_isEqual(this.props.currentFilters, prevProps.currentFilters)) {
        return this.updateNearbyReviewTasks(this.props)
      }

      if (this.state.taskLimit !== prevState.taskLimit) {
        return this.updateNearbyReviewTasks(this.props)
      }
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ['fetchNearbyReviewTasks'])}
          nearbyTasks={this.state.nearbyTasks}
          increaseTaskLimit={() => this.setState({taskLimit: (this.state.taskLimit + 5)})}
          hasMoreToLoad={this.state.hasMoreToLoad}
        />
      )
    }
  }

  _WithNearbyReviewTasks.propTypes = {
    fetchNearbyReviewTasks: PropTypes.func.isRequired,
  }

  return _WithNearbyReviewTasks
}

export const mapDispatchToProps =
  dispatch => bindActionCreators({ fetchNearbyReviewTasks }, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithNearbyReviewTasks(WrappedComponent))
