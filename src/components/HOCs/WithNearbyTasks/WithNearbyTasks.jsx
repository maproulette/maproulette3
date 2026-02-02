import _omit from "lodash/omit";
import PropTypes from "prop-types";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchBoundedTaskMarkers } from "../../../services/Task/BoundedTask";
import { fetchNearbyTasks } from "../../../services/Task/Task";
import { fetchNearbyTasksInBoundingBox } from "../../../services/Task/Task";

const MAX_NEARBY_TASK_LIMIT = 100;
/**
 * WithNearbyTasks provides tasks geographically closest to the current task
 * to the wrapped component, utilizing the same object structure as
 * clusteredTasks for maximum interoperability
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithNearbyTasks = function (WrappedComponent) {
  class _WithNearbyTasks extends Component {
    state = {
      nearbyTasks: null,
      taskLimit: 5,
      lastLoadLength: 0,
      mapBounds: null,
      loadByNearbyTasks: true,
      totalTasksInView: 0,
      loading: false,
    };

    /**
     * Parses the challenge id from the matched params of the route
     *
     * @private
     */
    standardChallengeId = (props) => parseInt(props.match?.params?.challengeId, 10);

    /**
     * Parses the virtual challenge id from the matched params of the route
     *
     * @private
     */
    virtualChallengeId = (props) => parseInt(props.match?.params?.virtualChallengeId, 10);

    /**
     * Determines whether this challenge is a virtual challenge
     *
     * @private
     */
    isVirtualChallenge = (props) => Number.isFinite(this.virtualChallengeId(props));

    /**
     * Parses the current standard or virtual challenge id from the matched params
     * of the route.
     *
     * @private
     */
    currentChallengeId = (props) =>
      this.isVirtualChallenge(props)
        ? this.virtualChallengeId(props)
        : this.standardChallengeId(props);

    /**
     * Kick off loading of tasks geographically closest to the current task.
     * Note that this represents the nearby tasks (and loading status) using
     * the same data structure as clusteredTasks to promote map and HOC
     * interoperability
     *
     * @private
     */
    updateNearbyTasks = async () => {
      const challengeId = this.currentChallengeId(this.props);
      const isVirtual = this.isVirtualChallenge(this.props);
      const excludeSelfLockedTasks = !!this.props.excludeSelfLockedTasks;

      if (Number.isFinite(challengeId) && this.props.fetchNearbyTasks) {
        try {
          this.setState({ loading: true });

          const nearbyTasks = await this.props.fetchNearbyTasks(
            challengeId,
            isVirtual,
            this.props.taskId,
            excludeSelfLockedTasks,
            this.state.taskLimit < MAX_NEARBY_TASK_LIMIT
              ? this.state.taskLimit
              : MAX_NEARBY_TASK_LIMIT,
          );

          if (!this._isMounted) return;
          const tasksLength = nearbyTasks.tasks.length;
          this.setState({
            nearbyTasks: {
              ...nearbyTasks,
              nearTaskId: this.props.taskId,
            },
            lastLoadLength: tasksLength,
            taskLimit: this.state.taskLimit + 5,
            loadByNearbyTasks: true,
            hasMoreToLoad: this.state.lastLoadLength !== tasksLength,
            loading: false,
          });
        } catch (error) {
          console.error("Error fetching nearby tasks:", error);
          if (this._isMounted) this.setState({ loading: false });
        }
      }
    };

    setMapBounds = (bounds) => {
      // Only update if bounds have actually changed
      if (
        !this.state.mapBounds ||
        bounds.getNorth() !== this.state.mapBounds.getNorth() ||
        bounds.getSouth() !== this.state.mapBounds.getSouth() ||
        bounds.getEast() !== this.state.mapBounds.getEast() ||
        bounds.getWest() !== this.state.mapBounds.getWest()
      ) {
        this.setState({ mapBounds: bounds });
      }
    };

    loadTasksInView = async () => {
      if (!this.state.mapBounds) return;
      const challengeId = this.currentChallengeId(this.props);
      const isVirtual = this.isVirtualChallenge(this.props);
      const excludeSelfLockedTasks = !!this.props.excludeSelfLockedTasks;

      const bounds = this.state.mapBounds;
      const boundingBox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];

      try {
        const nearbyTasks = await this.props.fetchNearbyTasksInBoundingBox(
          challengeId,
          isVirtual,
          this.props.taskId,
          excludeSelfLockedTasks,
          boundingBox,
          MAX_NEARBY_TASK_LIMIT,
        );
        if (!this._isMounted) return;
        const tasksLength = nearbyTasks.tasks?.length;

        if (tasksLength > 0) {
          this.setState({
            nearbyTasks: {
              ...nearbyTasks,
              nearTaskId: this.props.taskId,
            },
            lastLoadLength: tasksLength,
            taskLimit: tasksLength + 5,
            loadByNearbyTasks: false,
            totalTasksInView: tasksLength,
          });
        }
      } catch (error) {
        console.error("Error loading tasks in view:", error);
      }
    };

    componentDidMount() {
      this._isMounted = true;
      this.updateNearbyTasks();
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    componentDidUpdate(prevProps) {
      if (this.props.task && this.props.task?.id !== prevProps.task?.id) {
        this.setState({
          taskLimit: 0,
        });
        this.updateNearbyTasks(this.props);
      }
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, [
            "fetchNearbyTasks",
            "fetchBoundedTaskMarkers",
            "fetchNearbyTasksInBoundingBox",
          ])}
          nearbyTasks={{
            ...this.state.nearbyTasks,
            loading: this.state.loading,
          }}
          loadTasksInView={this.loadTasksInView}
          updateNearbyTasks={this.updateNearbyTasks}
          setMapBounds={this.setMapBounds}
          loadByNearbyTasks={this.state.loadByNearbyTasks}
          setLoadByNearbyTasks={() => this.setState({ loadByNearbyTasks: false })}
          totalTasksInView={this.state.lastLoadLength}
        />
      );
    }
  }

  _WithNearbyTasks.propTypes = {
    fetchNearbyTasks: PropTypes.func.isRequired,
    fetchBoundedTaskMarkers: PropTypes.func.isRequired,
    fetchNearbyTasksInBoundingBox: PropTypes.func.isRequired,
    taskId: PropTypes.number,
    match: PropTypes.object,
    excludeSelfLockedTasks: PropTypes.bool,
  };

  return _WithNearbyTasks;
};

export const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNearbyTasks,
      fetchBoundedTaskMarkers,
      fetchNearbyTasksInBoundingBox,
    },
    dispatch,
  );

export default (WrappedComponent) =>
  connect(null, mapDispatchToProps)(WithNearbyTasks(WrappedComponent));
