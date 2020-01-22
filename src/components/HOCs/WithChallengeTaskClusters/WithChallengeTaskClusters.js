import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _isEqual from 'lodash/isEqual'
import _uniqueId from 'lodash/uniqueId'
import _sum from 'lodash/sum'
import _map from 'lodash/map'
import _set from 'lodash/set'
import _debounce from 'lodash/debounce'
import { fromLatLngBounds,
         boundsWithinAllowedMaxDegrees } from '../../../services/MapBounds/MapBounds'
import { fetchTaskClusters, clearTaskClusters }
       from '../../../services/Task/TaskClusters'
import { fetchBoundedTasks, clearBoundedTasks }
       from '../../../services/Task/BoundedTask'
import { maxAllowedDegrees } from '../WithMapBoundedTasks/WithMapBoundedTasks'

import { MAX_ZOOM, UNCLUSTER_THRESHOLD } from '../../TaskClusterMap/TaskClusterMap'

/**
 * WithChallengeTaskClusters makes available task clusters, within a challenge,
 * that match specified search/filter criteria
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithChallengeTaskClusters = function(WrappedComponent, storeTasks=false) {
  return class extends Component {
    state = {
      loading: false,
      fetchId: null,
      clusters: {},
      showAsClusters: true,
      taskCount: 0
    }

    updateBounds = (bounds, zoom, fromUserAction=false) => {
      if (this.props.criteria.boundingBox !== fromLatLngBounds(bounds).join(',')) {
        const criteria = _cloneDeep(this.props.criteria)
        criteria.boundingBox = fromLatLngBounds(bounds).join(',')
        this.props.updateTaskFilterBounds(bounds, zoom, fromUserAction)
      }
    }

    toggleShowAsClusters = () => {
      this.fetchUpdatedClusters(!this.state.showAsClusters)
    }

    fetchUpdatedClusters(wantToShowAsClusters) {
      if (!!_get(this.props, 'nearbyTasks.loading')) {
        return
      }
      const challengeId = _get(this.props, 'challenge.id', this.props.challengeId)

      // We need to fetch as clusters if any of the following:
      // 1. not at max zoom in and
      //    user wants to see clusters or our task count is greater than our
      //    threshold (eg. 1000 tasks)
      // 2. we have no bounding box
      const showAsClusters = (_get(this.props, 'criteria.zoom', 0) < MAX_ZOOM &&
        (wantToShowAsClusters || this.state.taskCount > UNCLUSTER_THRESHOLD)) ||
        !this.props.criteria.boundingBox

      const currentFetchId = _uniqueId()

      // If we have no challengeId and no bounding box we need to make sure
      // we aren't searching the entire map.
      if (!challengeId) {
        const bounds = _get(this.props.criteria, 'boundingBox')
        if (!bounds || !boundsWithinAllowedMaxDegrees(bounds, maxAllowedDegrees())) {
          this.props.clearTasksAndClusters()
          this.setState({clusters: {}, loading: false, taskCount: 0, showAsClusters: true,
                         mapZoomedOut: true})
          return
        }
      }

      this.setState({loading: true, fetchId: currentFetchId, showAsClusters: showAsClusters, mapZoomedOut: false})

      if (!showAsClusters) {
        const searchCriteria = _cloneDeep(this.props.criteria)
        if (challengeId) {
          _set(searchCriteria,
              'filters.challengeId',
               challengeId)
        }
        searchCriteria.page = 0

        // Fetch up to threshold+1 individual tasks (eg. 1001 tasks)
        this.props.fetchBoundedTasks(searchCriteria, UNCLUSTER_THRESHOLD + 1, !storeTasks, true, true).then(results => {
          if (currentFetchId >= this.state.fetchId) {
            // If we retrieved 1001 tasks then there might be more tasks and
            // they should be clustered. So fetch as clusters
            // (unless we are zoomed all the way in already)
            if (results.totalCount > UNCLUSTER_THRESHOLD &&
                _get(this.props, 'criteria.zoom', 0) < MAX_ZOOM) {
              this.props.fetchTaskClusters(challengeId, searchCriteria
              ).then(results => {
                const clusters = results.clusters
                if (currentFetchId >= this.state.fetchId) {
                  const taskCount = _sum(_map(clusters, c => c.numberOfPoints))
                  this.setState({clusters, loading: false,
                                 taskCount: taskCount, showAsClusters: true})
                }
              })
            }
            else {
              this.setState({clusters: results.tasks, loading: false,
                             taskCount: results.totalCount})
            }
          }
        }).catch(error => {
          console.log(error)
          this.setState({clusters: {}, loading: false, taskCount: 0})
        })
      }
      else {
        this.props.fetchTaskClusters(challengeId, this.props.criteria
        ).then(results => {
          const clusters = results.clusters
          if (currentFetchId >= this.state.fetchId) {
            const taskCount = _sum(_map(clusters, c => c.numberOfPoints))
            this.setState({clusters, loading: false,
                           taskCount: taskCount, showAsClusters: true})
          }
        }).catch(error => {
          console.log(error)
          this.setState({clusters: {}, loading: false, taskCount: 0, showAsClusters: true})
        })
      }
    }

    componentDidMount() {
      if (!this.props.skipInitialFetch) {
        this.fetchUpdatedClusters(this.state.showAsClusters)
      }
    }

    debouncedFetchClusters =
      _debounce((showAsClusters) => this.fetchUpdatedClusters(showAsClusters), 400)

    componentDidUpdate(prevProps, prevState) {
      if (!_isEqual(_get(prevProps.criteria, 'searchQuery'), _get(this.props.criteria, 'searchQuery'))) {
        this.debouncedFetchClusters(this.state.showAsClusters)
      }
      else if (!_isEqual(_omit(prevProps.criteria, ['page', 'pageSize']),
            _omit(this.props.criteria, ['page', 'pageSize']))) {
        this.fetchUpdatedClusters(this.state.showAsClusters)
      }
    }

    onBulkTaskSelection = taskIds => {
      this.props.onBulkTaskSelection(taskIds, this.state.clusters)
    }

    render() {
      const criteriaBounds = _get(this.props, 'criteria.boundingBox', '')

      return (
        <WrappedComponent
          {..._omit(this.props, ['taskClusters', 'fetchId', 'updateTaskClusters',
                                 'fetchTaskClusters', 'onBulkTaskSelection'])}
          taskClusters = {this.state.clusters}
          boundingBox={criteriaBounds}
          updateBounds = {this.updateBounds}
          onBulkTaskSelection = {this.onBulkTaskSelection}
          loading = {this.state.loading}
          toggleShowAsClusters = {this.toggleShowAsClusters}
          showAsClusters = {this.state.showAsClusters}
          totalTaskCount = {this.state.taskCount}
          mapZoomedOut = {this.state.mapZoomedOut}
        />
      )
    }
  }
}

export const mapDispatchToProps = dispatch => Object.assign(
  {},
  bindActionCreators({ fetchTaskClusters, fetchBoundedTasks }, dispatch),
  {
    clearTasksAndClusters: () => {
      dispatch(clearBoundedTasks())
      dispatch(clearTaskClusters())
    }
  }
)

export default (WrappedComponent, storeTasks) =>
  connect(null, mapDispatchToProps)(WithChallengeTaskClusters(WrappedComponent, storeTasks))
