import _omit from "lodash/omit";
import { denormalize } from "normalizr";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  addTaskComment,
  fetchTaskComments,
  taskDenormalizationSchema,
} from "../../../services/Task/Task";

const WithTaskComments = (WrappedComponent) =>
  connect(mapStateToProps, mapDispatchToProps)(WithLoadedComments(WrappedComponent));

export const mapStateToProps = (state, ownProps) => {
  const mappedProps = {};

  if (Number.isFinite(ownProps.taskId)) {
    const taskEntity = state.entities?.tasks?.[ownProps.taskId];

    if (taskEntity) {
      // denormalize task so that comments are embedded
      const denormalizedTask = denormalize(taskEntity, taskDenormalizationSchema(), state.entities);

      mappedProps.comments = denormalizedTask.comments;
    }
  }

  return mappedProps;
};

export const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchTaskComments,
      addTaskComment,
    },
    dispatch,
  );
};

export const WithLoadedComments = function (WrappedComponent) {
  return class extends Component {
    state = {
      commentsLoading: false,
    };

    loadComments = (taskId) => {
      if (!Number.isFinite(taskId)) {
        return;
      }

      this.setState({ commentsLoading: true });
      this.props.fetchTaskComments(taskId).then(() => this.setState({ commentsLoading: false }));
    };

    componentDidMount() {
      this.loadComments(this.props.taskId);
    }

    componentDidUpdate(prevProps) {
      if (this.props.taskId !== prevProps.taskId) {
        this.loadComments(this.props.taskId);
      }
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, "fetchTaskComments")}
          commentsLoading={this.state.commentsLoading}
        />
      );
    }
  };
};

export default WithTaskComments;
