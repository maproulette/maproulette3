import { connect } from "react-redux";
import { archiveProject } from "../../../../services/Project/Project";
import {
  archiveChallenges,
  fetchProjectChallenges,
  moveChallenges,
  deleteChallenge
} from "../../../../services/Challenge/Challenge";

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

  bulkArchive: (challengeIds, bool, callback = () => null) => {
    const projectId = ownProps.match.params.projectId;
    dispatch(archiveChallenges(projectId, challengeIds, bool)).then(() => {
      callback(projectId)
      dispatch(fetchProjectChallenges(projectId))
    });
  },

  moveChallenges: (challengeIds, toProjectId, callback = () => null) => {
    const projectId = ownProps.match.params.projectId;
    dispatch(moveChallenges(challengeIds, toProjectId)).then(() => {
      callback(projectId)
      dispatch(fetchProjectChallenges(projectId))
    });
  },

  deleteChallenges: (challengeIds, callback = () => null) => {
    const projectId = ownProps.match.params.projectId;

    challengeIds.forEach(id => {
      dispatch(deleteChallenge(id))
    });

    callback(projectId)
  },
});

const WithProjectManagement = (Component) => {
  return connect(null, mapDispatchToProps)(Component);
};

export default WithProjectManagement;
