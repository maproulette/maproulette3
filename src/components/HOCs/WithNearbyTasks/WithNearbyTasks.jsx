import _omit from "lodash/omit";
import PropTypes from "prop-types";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchNearbyTasks } from "../../../services/Task/Task";
import { fetchBoundedTaskMarkers } from "../../../services/Task/BoundedTask";

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
          const nearbyTasks = await this.props.fetchNearbyTasks(
            challengeId,
            isVirtual,
            this.props.taskId,
            excludeSelfLockedTasks,
            this.state.taskLimit,
          );

          const tasksLength = nearbyTasks.tasks.length;
          this.setState({
            nearbyTasks: {
              ...nearbyTasks,
              nearTaskId: this.props.taskId,
            },
            lastLoadLength: tasksLength,
            taskLimit: this.state.taskLimit + 5,
            loadByNearbyTasks: true,
            lastLoadLength: tasksLength,
            hasMoreToLoad: this.state.lastLoadLength !== tasksLength,
          });
        } catch (error) {
          console.error("Error fetching nearby tasks:", error);
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

      const bounds = this.state.mapBounds;
      const criteria = {
        boundingBox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
        challengeId: this.currentChallengeId(this.props),
      };

      try {
        const tasks = await this.props.fetchBoundedTaskMarkers(criteria, 1000);

        if (tasks && tasks.length > 0) {
          this.setState({
            nearbyTasks: {
              tasks: tasks, // Ensure tasks are properly nested
              loading: false,
              nearTaskId: this.props.taskId,
            },
            lastLoadLength: tasks.length,
            taskLimit: tasks.length + 5,
            loadByNearbyTasks: false,
          });
        }
      } catch (error) {
        console.error("Error loading tasks in view:", error);
      }
    };

    componentDidMount() {
      this.updateNearbyTasks(this.props);
    }

    // componentDidUpdate(prevProps, prevState) {
    //   if (
    //     this.state.nearbyTasks &&
    //     !this.state.nearbyTasks.loading &&
    //     this.props.taskId !== this.state.nearbyTasks.nearTaskId
    //   ) {
    //     this.updateNearbyTasks(this.props);
    //   }
    // }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ["fetchNearbyTasks", "fetchBoundedTaskMarkers"])}
          nearbyTasks={this.state.nearbyTasks}
          loadTasksInView={this.loadTasksInView}
          updateNearbyTasks={this.updateNearbyTasks}
          setMapBounds={this.setMapBounds}
          loadByNearbyTasks={this.state.loadByNearbyTasks}
          setLoadByNearbyTasks={() => this.setState({ loadByNearbyTasks: false })}
        />
      );
    }
  }

  _WithNearbyTasks.propTypes = {
    fetchNearbyTasks: PropTypes.func.isRequired,
    fetchBoundedTaskMarkers: PropTypes.func.isRequired,
    taskId: PropTypes.number,
    match: PropTypes.object,
    excludeSelfLockedTasks: PropTypes.bool,
  };

  return _WithNearbyTasks;
};

export const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchNearbyTasks, fetchBoundedTaskMarkers }, dispatch);

export default (WrappedComponent) =>
  connect(null, mapDispatchToProps)(WithNearbyTasks(WrappedComponent));
