import { Component } from "react";
import { connect } from "react-redux";
import { deleteTask, saveTask } from "../../../../services/Task/Task";
import WithLoadedTask from "../../../HOCs/WithLoadedTask/WithLoadedTask";

/**
 * WithCurrentTask makes available to the WrappedComponent the current task
 * from the route as well as relevant admin functions like save and delete.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithCurrentTask = function (WrappedComponent) {
  return class extends Component {
    render() {
      const taskId = parseInt(this.props.match?.params?.taskId, 10);
      return (
        <WrappedComponent
          key={taskId}
          taskId={taskId}
          challengeId={parseInt(this.props.match?.params?.challengeId, 10)}
          projectId={parseInt(this.props.match?.params?.projectId, 10)}
          {...this.props}
        />
      );
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  saveTask: (taskData) => dispatch(saveTask(taskData)),
  deleteTask: (taskId) => dispatch(deleteTask(taskId)),
});

export default (WrappedComponent) =>
  connect(null, mapDispatchToProps)(WithCurrentTask(WithLoadedTask(WrappedComponent)));
