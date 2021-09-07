import { connect } from "react-redux";
import { archiveProject } from "../../../../services/Project/Project";
import { archiveChallenges, fetchProjectChallenges } from "../../../../services/Challenge/Challenge";

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

  bulkArchive: (challengeIds, bool, callback) => {
    const projectId = ownProps.match.params.projectId;
    dispatch(archiveChallenges(projectId, challengeIds, bool)).then(() => {
      callback(projectId)
      dispatch(fetchProjectChallenges(projectId))
    });
  },
});

const WithProjectManagement = (Component) => {
  return connect(null, mapDispatchToProps)(Component);
};

export default WithProjectManagement;
