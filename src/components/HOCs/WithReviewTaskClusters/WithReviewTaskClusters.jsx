import { Component } from 'react'
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
      loadMap: false,
    }

    updateBounds(bounds) {
      if (!this.state.loadMap) {
        this.setState({loadMap: true})
      }
      const criteria = _cloneDeep(this.props.reviewCriteria)
      criteria.boundingBox = fromLatLngBounds(bounds).join(',')
      this.props.updateReviewTasks(criteria)
    }

    fetchUpdatedClusters(forceLoad = false) {
      if (this.state.loadMap || forceLoad) {
        this.setState({loading: true})

        this.props.fetchClusteredReviewTasks(
          this.props.reviewTasksType, this.props.reviewCriteria
        ).catch(() => {}).then(() => this.setState({loading: false}))
      }
    }

    componentDidMount() {
      if (this.props.reviewCriteria.boundingBox) {
        this.setState({loadMap: true})
        this.fetchUpdatedClusters(true)
      }
      else {
        this.fetchUpdatedClusters()
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevProps.reviewTasksType !== this.props.reviewTasksType) {
        this.fetchUpdatedClusters()
      }
      else if (prevProps.reviewCriteria !== this.props.reviewCriteria) {
        if (this.props.reviewCriteria.boundingBox) {
          this.setState({loadMap: true})
          this.fetchUpdatedClusters(true)
        }
        else {
          this.fetchUpdatedClusters()
        }
      }
      else if (this.state.loadMap !== prevState.loadMap) {
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
          updateBounds={bounds => this.updateBounds(bounds)}
          loading={this.state.loading}
          delayMapLoad={!this.state.loadMap}
          forceMapLoad={() => this.setState({loadMap: true})}
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
