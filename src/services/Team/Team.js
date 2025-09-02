import { fetchProjectManagers } from "../Project/Project";
import Endpoint from "../Server/Endpoint";
import { defaultRoutes as api, websocketClient } from "../Server/Server";

export const subscribeToTeamUpdates = function (callback, handle) {
  websocketClient.addServerSubscription("teams", null, handle, (messageObject) =>
    callback(messageObject),
  );
};

export const unsubscribeFromTeamUpdates = function (handle) {
  websocketClient.removeServerSubscription("teams", null, handle);
};

// async action creators

/**
 * Search for teams by name. Resolves with a (possibly empty) list of results
 */
export const findTeam = function (teamName) {
  return new Endpoint(api.teams.find, { params: { name: teamName } }).execute();
};

/**
 * Set a team's granted role on a project
 */
export const setTeamProjectRole = function (projectId, teamId, role) {
  return function (dispatch) {
    return new Endpoint(api.team.setProjectRole, {
      variables: { teamId, projectId, role },
    })
      .execute()
      .then(() => fetchProjectManagers(projectId)(dispatch));
  };
};

/**
 * Set a team's granted role on a project
 */
export const removeTeamFromProject = function (projectId, teamId) {
  return function (dispatch) {
    return new Endpoint(api.team.removeFromProject, {
      variables: { teamId, projectId },
    })
      .execute()
      .then(() => fetchProjectManagers(projectId)(dispatch));
  };
};
