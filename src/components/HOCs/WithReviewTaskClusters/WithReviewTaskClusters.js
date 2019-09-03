import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _cloneDeep from 'lodash/cloneDeep'
import _isEmpty from 'lodash/isEmpty'
import { fromLatLngBounds } from '../../../services/MapBounds/MapBounds'
import { fetchClusteredReviewTasks }
       from '../../../services/Task/TaskReview/TaskReview'

/**
 * WithReviewTaskClusters retrieves clusters for the currently filtered review
 * tasks
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithReviewTaskClusters = function(WrappedComponent) {
  return class extends Component {
    state = {
      loading: false,
    }

    updateBounds(bounds) {
      const criteria = _cloneDeep(this.props.reviewCriteria)
      criteria.boundingBox = fromLatLngBounds(bounds).join(',')
      this.props.updateReviewTasks(criteria)
    }

    fetchUpdatedClusters() {
      this.setState({loading: true})

      this.props.fetchClusteredReviewTasks(
        this.props.reviewTasksType, this.props.reviewCriteria
      ).catch(e => {}).then(() => this.setState({loading: false}))
    }

    componentDidMount() {
      this.fetchUpdatedClusters()
    }

    componentDidUpdate(prevProps) {
      if (prevProps.reviewTasksType !== this.props.reviewTasksType) {
        this.fetchUpdatedClusters()
      }
      else if (prevProps.reviewCriteria !== this.props.reviewCriteria) {
        this.fetchUpdatedClusters()
      }
    }

    render() {
      const reviewBounds = _get(this.props, 'reviewCriteria.boundingBox', '')
      const bounds = _isEmpty(reviewBounds) ? null : reviewBounds.split(',')

      return (
        <WrappedComponent
          {..._omit(this.props, ['reviewClusters', 'fetchId', 'updateReviewClusters'])}
          taskClusters = {this.props.reviewClusters}
          boundingBox={bounds}
          updateBounds = {bounds => this.updateBounds(bounds)}
          loading = {this.state.loading}
        />
      )
    }
  }
}

const mapStateToProps = state => ({ reviewClusters: _get(state, 'currentReviewTasks.clusters') })

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchClusteredReviewTasks,
}, dispatch)

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithReviewTaskClusters(WrappedComponent))
