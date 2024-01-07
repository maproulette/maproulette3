import { defaultRoutes as api, websocketClient } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import { fetchProjectManagers } from '../Project/Project'

export const subscribeToTeamUpdates = function(callback, handle) {
  websocketClient.addServerSubscription(
    "teams",
    null,
    handle,
    messageObject => callback(messageObject)
  )
}

export const unsubscribeFromTeamUpdates = function(handle) {
  websocketClient.removeServerSubscription("teams", null, handle)
}

// async action creators

/**
 * Search for teams by name. Resolves with a (possibly empty) list of results
 */
export const findTeam = async function (teamName) {
  return await new Endpoint(api.teams.find, {params: {name: teamName}}).execute().catch(error => {
    console.error('Error finding team:', error)
  })
}

/**
 * Set a team's granted role on a project
 */
export const setTeamProjectRole = function(projectId, teamId, role) {
  return async function(dispatch) {
    try {
      await new Endpoint(api.team.setProjectRole, {
        variables: { teamId, projectId, role },
      }).execute()
  
      await fetchProjectManagers(projectId)(dispatch)
    } catch (error) {
      console.error('Error setting team project role:', error)
    }
  }
}

/**
 * Set a team's granted role on a project
 */
export const removeTeamFromProject = function(projectId, teamId) {
  return async function(dispatch) {
    try {
      await new Endpoint(api.team.removeFromProject, {
        variables: {teamId, projectId},
      }).execute()
  
      await fetchProjectManagers(projectId)(dispatch)
    } catch (error) {
      console.error('Error removing team from project:', error)
    }
  }
}
