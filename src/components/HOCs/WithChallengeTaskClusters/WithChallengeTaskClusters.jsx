import { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _isEqual from 'lodash/isEqual'
import _uniqueId from 'lodash/uniqueId'
import _sum from 'lodash/sum'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import _set from 'lodash/set'
import _debounce from 'lodash/debounce'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'
import { fromLatLngBounds, boundsWithinAllowedMaxDegrees }
       from '../../../services/MapBounds/MapBounds'
import { fetchTaskClusters, clearTaskClusters }
       from '../../../services/Task/TaskClusters'
import { fetchBoundedTaskMarkers, fetchBoundedTasks, clearBoundedTasks }
       from '../../../services/Task/BoundedTask'
import { MAX_ZOOM, UNCLUSTER_THRESHOLD } from '../../TaskClusterMap/TaskClusterMap'

/**
 * WithChallengeTaskClusters makes available task clusters, within a challenge,
 * that match specified search/filter criteria
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithChallengeTaskClusters = function(WrappedComponent, storeTasks=false,
  showClusters=true, ignoreLocked=true, skipInitialFetch=false) {
  return class extends Component {
    _isMounted = false

    state = {
      loading: false,
      fetchId: null,
      clusters: {},
      showAsClusters: showClusters,
      taskCount: 0
    }

    updateBounds = (bounds, zoom, fromUserAction=false) => {
      const arrayBounds = fromLatLngBounds(bounds)
      if (this.props.criteria.boundingBox !== arrayBounds.join(',')) {
        const criteria = _cloneDeep(this.props.criteria)
        criteria.boundingBox = arrayBounds.join(',')
        this.props.updateTaskFilterBounds(bounds, zoom, fromUserAction)
      }
    }

    toggleShowAsClusters = () => {
      this.fetchUpdatedClusters(!this.state.showAsClusters)
    }

    onClickFetchClusters = () => {
      this.fetchUpdatedClusters(this.state.showAsClusters, true)
    }

    fetchUpdatedClusters(wantToShowAsClusters, overrideDisable = false) {
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
        if (!bounds || !boundsWithinAllowedMaxDegrees(bounds)) {
          this.props.clearTasksAndClusters()
          this.setState({clusters: {}, loading: false, taskCount: 0, showAsClusters: true,
                         mapZoomedOut: true})
          return
        }
      }

      this.setState({loading: true, fetchId: currentFetchId, showAsClusters: showAsClusters, mapZoomedOut: false})

      const searchCriteria = _cloneDeep(this.props.criteria)

      if (challengeId) {
        _set(searchCriteria,
          'filters.challengeId',
           challengeId);
        _set(searchCriteria, 'filters.archived', true)
      }

      if (this.props.taskBundle && this.props.bundledOnly ){
        _set(searchCriteria, 'filters.bundleId', this.props.taskBundle.bundleId)
      }

      if (window.env.REACT_APP_DISABLE_TASK_CLUSTERS && !overrideDisable) {
        return this.setState({ loading: false })
      }

      if (!showAsClusters) {
        searchCriteria.page = 0

        // Fetch up to threshold+1 individual tasks (eg. 1001 tasks)
        this.props.fetchBoundedTaskMarkers(searchCriteria, UNCLUSTER_THRESHOLD + 1, !storeTasks, ignoreLocked).then(results => {
          if (currentFetchId >= this.state.fetchId) {
            const totalCount = results.length
            // If we retrieved 1001 tasks then there might be more tasks and
            // they should be clustered. So fetch as clusters
            // (unless we are zoomed all the way in already)
            if (totalCount > UNCLUSTER_THRESHOLD &&
                _get(this.props, 'criteria.zoom', 0) < MAX_ZOOM) {
              this.props.fetchTaskClusters(challengeId, searchCriteria, 25, overrideDisable
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
              this.setState({clusters: results, loading: false,
                             taskCount: totalCount})
            }
          }
        }).catch(error => {
          console.log(error)
          this.setState({clusters: {}, loading: false, taskCount: 0})
        })
      }
      else {
        this.props.fetchTaskClusters(challengeId, searchCriteria, 25, overrideDisable
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
      this._isMounted = true

      if (!skipInitialFetch) {
        this.debouncedFetchClusters(this.state.showAsClusters)
      }

      if (window.env.REACT_APP_DISABLE_TASK_CLUSTERS) {
        const bounds = _get(this.props.criteria, 'boundingBox')
        if (!bounds || !boundsWithinAllowedMaxDegrees(bounds)) {
          this.setState({ mapZoomedOut: true })
        }
      }
    }

    componentWillUnmount() {
      this._isMounted = false
    }

    debouncedFetchClusters =
      _debounce((showAsClusters) => {if(this._isMounted)this.fetchUpdatedClusters(showAsClusters), 800})

    componentDidUpdate(prevProps) {
      if (!_isEqual(_get(prevProps.criteria, 'searchQuery'), _get(this.props.criteria, 'searchQuery'))) {
        this.debouncedFetchClusters(this.state.showAsClusters)
      }
      else if (!_isEqual(_omit(prevProps.criteria, ['page', 'pageSize']),
            _omit(this.props.criteria, ['page', 'pageSize']))) {
        this.debouncedFetchClusters(this.state.showAsClusters)
      } else if(this.props.taskBundle && 
        (this.props.bundledOnly !== prevProps.bundledOnly || 
        this.props.taskBundle !== prevProps.taskBundle)){
        this.debouncedFetchClusters(this.state.showAsClusters)
      }
    }

    clustersAsTasks = () => {
      if (_isEmpty(this.state.clusters)) {
        return this.state.clusters
      }

      // Sometimes we have tasks, sometimes single-point clusters depending on
      // whether tasks have been unclustered. Either way, represent as tasks
      return _isFinite(this.state.clusters[0].clusterId) ? // clusters
             _map(this.state.clusters, cluster => ({
               id: cluster.taskId,
               status: cluster.taskStatus,
               priority: cluster.taskPriority,
               parentId: cluster.challengeIds[0],
               geometries: cluster.geometries,
             })) :
             this.state.clusters // tasks
    }

    onBulkTaskSelection = taskIds => {
      const tasks = this.clustersAsTasks().filter(task => {
        const taskId = task.id || task.taskId
        const alreadyBundled = task.bundleId && this.props.taskBundle?.bundleId !== task.bundleId
        
        return taskIds.includes(taskId) && !alreadyBundled &&
          !(
            this.props.task &&
            ![0, 3, 6].includes(task.taskStatus || task.status) &&
            (!this.props.taskBundle?.taskIds?.includes(taskId) &&
              !this.props.initialBundle?.taskIds?.includes(taskId))
          ) &&
          taskId
      })
      
      this.props.onBulkTaskSelection(tasks)
    }

    onBulkTaskDeselection = taskIds => {
      const tasks =
        _filter(this.clustersAsTasks(), task => taskIds.indexOf(task.id) !== -1)
      this.props.onBulkTaskDeselection(tasks)
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
          onBulkTaskDeselection = {this.onBulkTaskDeselection}
          loading = {this.state.loading}
          toggleShowAsClusters = {this.toggleShowAsClusters}
          showAsClusters = {this.state.showAsClusters}
          totalTaskCount = {this.state.taskCount}
          mapZoomedOut = {this.state.mapZoomedOut}
          onClickFetchClusters = {this.onClickFetchClusters}
        />
      )
    }
  }
}

export const mapDispatchToProps = dispatch => Object.assign(
  {},
  bindActionCreators({ fetchTaskClusters, fetchBoundedTaskMarkers, fetchBoundedTasks }, dispatch),
  {
    clearTasksAndClusters: () => {
      dispatch(clearBoundedTasks())
      dispatch(clearTaskClusters())
    }
  }
)

export default (WrappedComponent, storeTasks, showClusters, ignoreLocked, skipInitialFetch) =>
  connect(null, mapDispatchToProps)(WithChallengeTaskClusters(WrappedComponent,
    storeTasks, showClusters, ignoreLocked, skipInitialFetch))
