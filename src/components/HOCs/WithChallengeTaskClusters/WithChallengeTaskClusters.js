import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _isEqual from 'lodash/isEqual'
import _set from 'lodash/set'
import _uniqueId from 'lodash/uniqueId'
import _sum from 'lodash/sum'
import _map from 'lodash/map'
import { fromLatLngBounds,
         boundsWithinAllowedMaxDegrees } from '../../../services/MapBounds/MapBounds'
import { fetchTaskClusters } from '../../../services/Task/TaskClusters'
import { fetchBoundedTasks } from '../../../services/Task/BoundedTask'
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

    updateBounds = (bounds, zoom) => {
      if (this.props.criteria.boundingBox !== fromLatLngBounds(bounds).join(',')) {
        const criteria = _cloneDeep(this.props.criteria)
        criteria.boundingBox = fromLatLngBounds(bounds).join(',')
        this.props.updateTaskFilterBounds(bounds, zoom)
      }
    }

    toggleShowAsClusters = () => {
      this.setState({showAsClusters: !this.state.showAsClusters})
    }

    fetchUpdatedClusters() {
      if (!!_get(this.props, 'nearbyTasks.loading')) {
        return
      }
      const challengeId = _get(this.props, 'challenge.id', this.props.challengeId)
      const showAsClusters = ((_get(this.props, 'criteria.zoom', 0) < MAX_ZOOM &&
                               this.state.showAsClusters) ||
                              !this.props.criteria.boundingBox) ||
                             this.state.taskCount > UNCLUSTER_THRESHOLD

      const currentFetchId = _uniqueId()

      if (!challengeId) {
        const bounds = _get(this.props.criteria, 'boundingBox')
        console.log(bounds)
        if (!bounds || !boundsWithinAllowedMaxDegrees(bounds, maxAllowedDegrees())) {
          this.setState({clusters: {}, loading: false, taskCount: 0, showAsClusters: true,
                         mapToLarge: true})
          return
        }
      }

      this.setState({loading: true, fetchId: currentFetchId, showAsClusters: showAsClusters, mapToLarge: false})

      if (!showAsClusters) {
        const criteria = _set(this.props.criteria,
                              'filters.challengeId',
                              challengeId)
        criteria.page = 0

        this.props.fetchBoundedTasks(criteria, UNCLUSTER_THRESHOLD + 1, !storeTasks).then(results => {
          if (currentFetchId >= this.state.fetchId) {
            if (results.totalCount > UNCLUSTER_THRESHOLD) {
              this.props.fetchTaskClusters(challengeId, this.props.criteria
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
        this.fetchUpdatedClusters()
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (!_isEqual(_omit(prevProps.criteria, ['page', 'pageSize']),
            _omit(this.props.criteria, ['page', 'pageSize']))) {
        this.fetchUpdatedClusters()
      }

      if (this.state.showAsClusters !== prevState.showAsClusters) {
        this.fetchUpdatedClusters()
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
          mapToLarge = {this.state.mapToLarge}
        />
      )
    }
  }
}

export const mapDispatchToProps =
  dispatch => bindActionCreators({ fetchTaskClusters, fetchBoundedTasks }, dispatch)

export default (WrappedComponent, storeTasks) =>
  connect(null, mapDispatchToProps)(WithChallengeTaskClusters(WrappedComponent, storeTasks))
