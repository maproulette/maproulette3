import React from "react";
import { connect } from "react-redux";
import { archiveProject } from "../../../../services/Project/Project";

/**
 * WithProjectManagement provides functions to its WrappedComponent that can
 * support management capabilities.
 */

const mapDispatchToProps = (dispatch, ownProps) => ({
  archiveProject: (projectId) => {
    dispatch(archiveProject(projectId, true)).then(() =>
      ownProps.history.replace(ownProps.location.pathname)
    );
  },

  unarchiveProject: (projectId) => {
    dispatch(archiveProject(projectId, false)).then(() =>
      ownProps.history.replace(ownProps.location.pathname)
    );
  },
});

const WithProjectManagement = (Component) => {
  return connect(null, mapDispatchToProps)(Component);
};

export default WithProjectManagement;
