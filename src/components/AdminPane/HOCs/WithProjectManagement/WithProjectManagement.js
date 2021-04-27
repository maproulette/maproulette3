import { connect } from "react-redux";

/**
 * WithProjectManagement provides functions to its WrappedComponent that can
 * support management capabilities.
 */
const WithProjectManagement = (WrappedComponent) =>
  connect(null, mapDispatchToProps)(WrappedComponent);

const mapDispatchToProps = (dispatch, ownProps) => ({
  archiveProject: (projectId, pathname) => {
    // dispatch(archiveProject(projectId, true)).then(() =>
    //   ownProps.history.replace(pathname)
    // );
  },

  unarchiveProject: (projectId, pathname) => {
    // dispatch(archiveProject(projectId, false)).then(() =>
    //   ownProps.history.replace(pathname)
    // );
  },
});

export default WithProjectManagement;
