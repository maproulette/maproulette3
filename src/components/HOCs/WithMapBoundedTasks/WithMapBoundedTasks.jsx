import _filter from "lodash/filter";
import _find from "lodash/find";
import _map from "lodash/map";
import _omit from "lodash/omit";
import { Component } from "react";
import { connect } from "react-redux";
import AppErrors from "../../../services/Error/AppErrors";
import { addError } from "../../../services/Error/Error";
import {
  boundsWithinAllowedMaxDegrees,
  toLatLngBounds,
} from "../../../services/MapBounds/MapBounds";
import { loadRandomTaskFromVirtualChallenge } from "../../../services/Task/Task";
import { createVirtualChallenge } from "../../../services/VirtualChallenge/VirtualChallenge";

/**
 * WithMapBoundedTasks retrieves map-bounded task clusters (regardless of
 * challenge) within the given mapBounds bounding box when it's of an
 * appropriately small size as determiend by the
 * REACT_APP_BOUNDED_TASKS_MAX_DIMENSION .env setting.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithMapBoundedTasks = function (WrappedComponent, mapType, matchChallenges = true) {
  return class extends Component {
    state = {
      creatingVirtualChallenge: false,
    };

    /**
     * Ensure bounds are represented as LatLngBounds object.
     */
    normalizedBounds = (props) => toLatLngBounds(props.mapBounds?.bounds);

    /**
     * Applies bounds and challenge filters to the map-bounded tasks, as
     * appropriate, returning only those tasks that pass the filters.
     */
    allowedTasks = () => {
      const bounds = this.normalizedBounds(this.props);
      let mapBoundedTasks = null;

      if (bounds && boundsWithinAllowedMaxDegrees(bounds)) {
        mapBoundedTasks = this.props.mapBoundedTasks;

        // If we have no mapBoundsTasks then we might be dealing with clusters.
        // If the clusters all represent individual tasks then these should be ok
        // to work on as a virtual challenge as well.
        if ((mapBoundedTasks?.tasks?.length ?? 0) === 0) {
          const clusters = this.props.mapBoundedTaskClusters.clusters;
          const areClustersAllTasks = !_find(clusters, (c) => !c.taskId);

          if (areClustersAllTasks && clusters?.length > 0) {
            mapBoundedTasks = {
              tasks: _map(clusters, (cluster) => {
                return { id: cluster.taskId, parentId: cluster.challengeIds[0] };
              }),
            };
          }
        }
      }

      if (!matchChallenges || (mapBoundedTasks?.tasks?.length ?? 0) === 0) {
        return mapBoundedTasks;
      }

      const allowedChallenges = new Set();

      for (const challenge of this.props.challenges) {
        allowedChallenges.add(challenge.id);
      }

      const filteredTasks = _filter(mapBoundedTasks.tasks, (task) =>
        allowedChallenges.has(task.parentId),
      );

      return Object.assign({}, mapBoundedTasks, { tasks: filteredTasks });
    };

    /**
     * Invoked when the user wishes to start work on the mapped tasks, creating
     * a virtual challenge.
     */
    startMapBoundedTasks = (name) => {
      const tasks = this.allowedTasks()?.tasks;
      if (tasks && tasks.length > 0) {
        this.setState({ creatingVirtualChallenge: true });

        this.props
          .startBoundedTasks(name, _map(tasks, "id"))
          .catch(() => {})
          .then(() => this.setState({ creatingVirtualChallenge: false }));
      } else {
        this.setState({ creatingVirtualChallenge: true });

        this.props
          .startBoundedTasks(name, null, this.props.mapBoundedTaskClusters.clusters)
          .catch(() => {})
          .then(() => this.setState({ creatingVirtualChallenge: false }));
      }
    };

    render() {
      return (
        <WrappedComponent
          mapBoundedTasks={this.allowedTasks()}
          startMapBoundedTasks={this.startMapBoundedTasks}
          creatingVirtualChallenge={this.state.creatingVirtualChallenge}
          {..._omit(this.props, ["mapBoundedTasks", "startBoundedTasks"])}
        />
      );
    }
  };
};

const mapStateToProps = (state) => ({
  mapBoundedTasks: state.currentBoundedTasks,
  mapBoundedTaskClusters: state.currentTaskClusters,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  startBoundedTasks: (name, taskIds, clusters) => {
    return dispatch(createVirtualChallenge(name, taskIds, null, clusters)).then(
      (virtualChallenge) => {
        dispatch(loadRandomTaskFromVirtualChallenge(virtualChallenge.id)).then((task) => {
          if (task) {
            ownProps.history.push(`/virtual/${virtualChallenge.id}/task/${task.id}`);
          } else {
            dispatch(addError(AppErrors.task.none));
          }
        });
      },
    );
  },
});

export default (WrappedComponent) =>
  connect(mapStateToProps, mapDispatchToProps)(WithMapBoundedTasks(WrappedComponent));
