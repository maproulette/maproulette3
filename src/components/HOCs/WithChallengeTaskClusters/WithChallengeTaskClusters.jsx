import _cloneDeep from "lodash/cloneDeep";
import _debounce from "lodash/debounce";
import _filter from "lodash/filter";
import _isEmpty from "lodash/isEmpty";
import _isEqual from "lodash/isEqual";
import _map from "lodash/map";
import _omit from "lodash/omit";
import _set from "lodash/set";
import _sum from "lodash/sum";
import _uniqueId from "lodash/uniqueId";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  boundsWithinAllowedMaxDegrees,
  fromLatLngBounds,
} from "../../../services/MapBounds/MapBounds";
import {
  clearBoundedTasks,
  fetchBoundedTaskMarkers,
  fetchBoundedTasks,
} from "../../../services/Task/BoundedTask";
import { clearTaskClusters, fetchTaskClusters } from "../../../services/Task/TaskClusters";
import { MAX_ZOOM, UNCLUSTER_THRESHOLD } from "../../TaskClusterMap/TaskClusterMap";

/**
 * WithChallengeTaskClusters makes available task clusters, within a challenge,
 * that match specified search/filter criteria
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithChallengeTaskClusters = function (
  WrappedComponent,
  storeTasks = false,
  showClusters = true,
  ignoreLocked = true,
  skipInitialFetch = false,
) {
  return class extends Component {
    _isMounted = false;

    state = {
      loading: false,
      fetchId: null,
      clusters: {},
      showAsClusters: showClusters,
      taskCount: 0,
    };

    updateBounds = (bounds, zoom, fromUserAction = false) => {
      const arrayBounds = fromLatLngBounds(bounds);
      if (this.props.criteria.boundingBox !== arrayBounds.join(",")) {
        const criteria = _cloneDeep(this.props.criteria);
        criteria.boundingBox = arrayBounds.join(",");
        this.props.updateTaskFilterBounds(bounds, zoom, fromUserAction);
      }
    };

    toggleShowAsClusters = () => {
      this.fetchUpdatedClusters(!this.state.showAsClusters);
    };

    onClickFetchClusters = () => {
      this.fetchUpdatedClusters(this.state.showAsClusters, true);
    };

    fetchUpdatedClusters(wantToShowAsClusters, overrideDisable = false) {
      // Don't fetch clusters if nearby tasks are still loading and we don't have a task bundle
      if (this.props.nearbyTasks?.loading && !this.props.taskBundle) {
        return;
      }

      const challengeId = this.props.challenge?.id ?? this.props.challengeId;

      // If we have no challengeId and no bounding box we need to make sure
      // we aren't searching the entire map.
      if (!challengeId) {
        const bounds = this.props.criteria?.boundingBox;
        const isValidBounds = bounds && boundsWithinAllowedMaxDegrees(bounds);

        if (!isValidBounds) {
          this.props.clearTasksAndClusters();
          this.setState({
            clusters: {},
            loading: false,
            taskCount: 0,
            showAsClusters: true,
            mapZoomedOut: true,
          });
          return;
        }
      }

      // Determine whether to show tasks as clusters based on several conditions
      const determineShowAsClusters = () => {
        // Don't cluster if we have no bounding box
        if (!this.props.criteria.boundingBox) {
          return true;
        }

        // Don't cluster at max zoom level
        if ((this.props.criteria?.zoom ?? 0) >= MAX_ZOOM) {
          return false;
        }

        // Don't cluster when createTaskBundle exists (we're in a the task bundle widget)
        if (this.props.createTaskBundle) {
          return false;
        }

        // Always cluster if there are more tasks than our threshold
        if (this.state.taskCount > UNCLUSTER_THRESHOLD) {
          return true;
        }

        // Otherwise respect the user's clustering preference
        return wantToShowAsClusters;
      };

      const showAsClusters = determineShowAsClusters();

      const currentFetchId = _uniqueId();

      this.setState({
        loading: true,
        fetchId: currentFetchId,
        showAsClusters: showAsClusters,
        mapZoomedOut: false,
      });

      const searchCriteria = _cloneDeep(this.props.criteria);

      if (challengeId) {
        _set(searchCriteria, "filters.challengeId", challengeId);
        _set(searchCriteria, "filters.archived", true);
      }

      // Ensure task status filters are included
      if (!searchCriteria.filters) {
        searchCriteria.filters = {};
      }

      // Set default task status filter if not present (all statuses)
      if (!searchCriteria.filters.status) {
        _set(searchCriteria, "filters.status", [0, 1, 2, 3, 4, 5, 6, 9]);
      }

      // Set default priorities if not present
      if (!searchCriteria.filters.priorities) {
        _set(searchCriteria, "filters.priorities", [0, 1, 2]);
      }

      // Set default review statuses if not present
      if (!searchCriteria.filters.reviewStatus) {
        _set(searchCriteria, "filters.reviewStatus", [0, 1, 2, 3, 4, 5, 6, 7, -1]);
      }

      // Set default meta review statuses if not present
      if (!searchCriteria.filters.metaReviewStatus) {
        _set(searchCriteria, "filters.metaReviewStatus", [0, 1, 2, 3, 5, 6, 7, -2, -1]);
      }

      if (window.env.REACT_APP_DISABLE_TASK_CLUSTERS && !overrideDisable) {
        return this.setState({ loading: false });
      }

      if (!showAsClusters) {
        searchCriteria.page = 0;

        // Fetch up to threshold+1 individual tasks (eg. 1001 tasks)
        this.props
          .fetchBoundedTaskMarkers(
            searchCriteria,
            UNCLUSTER_THRESHOLD + 1,
            !storeTasks,
            ignoreLocked,
          )
          .then((results) => {
            if (currentFetchId >= this.state.fetchId) {
              const totalCount = results.length;
              // If we retrieved 1001 tasks then there might be more tasks and
              // they should be clustered. So fetch as clusters
              // (unless we are zoomed all the way in already)
              if (totalCount > UNCLUSTER_THRESHOLD && (this.props.criteria?.zoom ?? 0) < MAX_ZOOM) {
                this.props
                  .fetchTaskClusters(challengeId, searchCriteria, 25, overrideDisable)
                  .then((results) => {
                    const clusters = results.clusters;
                    if (currentFetchId >= this.state.fetchId) {
                      const taskCount = _sum(_map(clusters, (c) => c.numberOfPoints));
                      this.setState({
                        clusters,
                        loading: false,
                        taskCount: taskCount,
                        showAsClusters: true,
                      });
                    }
                  });
              } else {
                this.setState({
                  clusters: results,
                  loading: false,
                  taskCount: totalCount,
                });
              }
            }
          })
          .catch((error) => {
            console.log(error);
            this.setState({ clusters: {}, loading: false, taskCount: 0 });
          });
      } else {
        this.props
          .fetchTaskClusters(challengeId, searchCriteria, 25, overrideDisable)
          .then((results) => {
            const clusters = results.clusters;
            if (currentFetchId >= this.state.fetchId) {
              const taskCount = _sum(_map(clusters, (c) => c.numberOfPoints));
              this.setState({
                clusters,
                loading: false,
                taskCount: taskCount,
                showAsClusters: true,
              });
            }
          })
          .catch((error) => {
            console.log(error);
            this.setState({
              clusters: {},
              loading: false,
              taskCount: 0,
              showAsClusters: true,
            });
          });
      }
    }

    componentDidMount() {
      this._isMounted = true;

      if (!skipInitialFetch) {
        this.debouncedFetchClusters(this.state.showAsClusters);
      }

      if (window.env.REACT_APP_DISABLE_TASK_CLUSTERS) {
        const bounds = this.props.criteria?.boundingBox;
        if (!bounds || !boundsWithinAllowedMaxDegrees(bounds)) {
          this.setState({ mapZoomedOut: true });
        }
      }
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    debouncedFetchClusters = _debounce((showAsClusters) => {
      if (this._isMounted) this.fetchUpdatedClusters(showAsClusters), 800;
    });

    componentDidUpdate(prevProps) {
      // Check if search query has changed
      const hasSearchQueryChanged = !_isEqual(
        prevProps.criteria?.searchQuery,
        this.props.criteria?.searchQuery,
      );

      if (hasSearchQueryChanged) {
        this.debouncedFetchClusters(this.state.showAsClusters);
        return;
      }

      // Check if any criteria besides pagination has changed
      const prevCriteriaWithoutPagination = _omit(prevProps.criteria, ["page", "pageSize"]);
      const currentCriteriaWithoutPagination = _omit(this.props.criteria, ["page", "pageSize"]);

      const hasCriteriaChanged = !_isEqual(
        prevCriteriaWithoutPagination,
        currentCriteriaWithoutPagination,
      );

      if (hasCriteriaChanged) {
        this.debouncedFetchClusters(this.state.showAsClusters);
      }
    }

    clustersAsTasks = () => {
      // Return empty clusters as-is
      if (_isEmpty(this.state.clusters)) {
        return this.state.clusters;
      }

      // Determine if we're dealing with clusters or individual tasks
      const hasClusters = Number.isFinite(this.state.clusters[0].clusterId);

      if (hasClusters) {
        // Convert clusters to task format
        return _map(this.state.clusters, (cluster) => ({
          id: cluster.taskId,
          status: cluster.taskStatus,
          priority: cluster.taskPriority,
          parentId: cluster.challengeIds[0],
          geometries: cluster.geometries,
        }));
      } else {
        // Data is already in task format
        return this.state.clusters;
      }
    };

    onBulkTaskSelection = (taskIds) => {
      if (!this.props.onBulkTaskSelection || typeof this.props.onBulkTaskSelection !== "function") {
        return;
      }

      const tasks = this.clustersAsTasks().filter((task) => {
        const taskId = task.id || task.taskId;
        const alreadyBundled =
          task.bundleId && this.props.initialBundle?.bundleId !== task.bundleId;
        const taskStatus = task.taskStatus || task.status;

        // Skip if task has no ID
        if (!taskId) {
          return false;
        }

        // Skip if task is not in the selected taskIds
        if (!taskIds.includes(taskId)) {
          return false;
        }

        // Skip if task is already bundled in a different bundle
        if (alreadyBundled) {
          return false;
        }

        // Skip if task has an invalid status when this.props.task exists
        // Valid statuses are: 0 (created), 3 (skipped), 6 (false positive)
        if (this.props.task && ![0, 3, 6].includes(taskStatus)) {
          return false;
        }

        // Skip if task is locked by another user
        if (task.lockedBy && task.lockedBy !== this.props.user.id) {
          return false;
        }

        return true;
      });

      this.props.onBulkTaskSelection(tasks);
    };

    onBulkTaskDeselection = (taskIds) => {
      if (
        !this.props.onBulkTaskDeselection ||
        typeof this.props.onBulkTaskDeselection !== "function"
      ) {
        return;
      }

      const tasks = _filter(this.clustersAsTasks(), (task) => taskIds.indexOf(task.id) !== -1);
      this.props.onBulkTaskDeselection(tasks);
    };

    render() {
      const criteriaBounds = this.props.criteria?.boundingBox ?? "";

      return (
        <WrappedComponent
          {..._omit(this.props, [
            "taskClusters",
            "fetchId",
            "updateTaskClusters",
            "fetchTaskClusters",
            "onBulkTaskSelection",
          ])}
          taskClusters={this.state.clusters}
          boundingBox={criteriaBounds}
          updateBounds={this.updateBounds}
          onBulkTaskSelection={this.onBulkTaskSelection}
          onBulkTaskDeselection={this.onBulkTaskDeselection}
          loading={this.state.loading}
          toggleShowAsClusters={this.toggleShowAsClusters}
          showAsClusters={this.state.showAsClusters}
          totalTaskCount={this.state.taskCount}
          mapZoomedOut={this.state.mapZoomedOut}
          onClickFetchClusters={this.onClickFetchClusters}
        />
      );
    }
  };
};

export const mapDispatchToProps = (dispatch) =>
  Object.assign(
    {},
    bindActionCreators({ fetchTaskClusters, fetchBoundedTaskMarkers, fetchBoundedTasks }, dispatch),
    {
      clearTasksAndClusters: () => {
        dispatch(clearBoundedTasks());
        dispatch(clearTaskClusters());
      },
    },
  );

export default (WrappedComponent, storeTasks, showClusters, ignoreLocked, skipInitialFetch) =>
  connect(
    null,
    mapDispatchToProps,
  )(
    WithChallengeTaskClusters(
      WrappedComponent,
      storeTasks,
      showClusters,
      ignoreLocked,
      skipInitialFetch,
    ),
  );
