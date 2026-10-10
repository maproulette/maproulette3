import Endpoint from "../../services/Server/Endpoint";
import { defaultRoutes as api } from "../../services/Server/Server";

export const MY_TEAMS = "myTeams";
export const TEAM_USERS = "teamUsers";

const withTeam = (teamUser) => ({
  ...teamUser,
  team: { id: teamUser.teamId, name: teamUser.teamName },
});

export const fetchMyTeams = async (userId) => {
  const memberships = await new Endpoint(api.teams.memberships, {
    variables: { userId },
  }).execute();

  const teams = await Promise.all(
    memberships.map((teamUser) =>
      new Endpoint(api.team.single, { variables: { id: teamUser.teamId } }).execute(),
    ),
  );

  return memberships.map((teamUser, index) => ({ ...teamUser, team: teams[index] }));
};

export const fetchTeamUsers = async (teamId) => {
  const teamUsers = await new Endpoint(api.team.members, { variables: { id: teamId } }).execute();
  return teamUsers.map(withTeam);
};

export const createTeam = ({ name, description }) =>
  new Endpoint(api.team.create, {
    json: { id: -1, name, description, groupType: 1 },
  }).execute();

export const updateTeam = ({ id, name, description, avatarURL }) =>
  new Endpoint(api.team.edit, {
    variables: { id },
    json: { id, name, description, avatarURL, groupType: 1 },
  }).execute();

export const deleteTeam = ({ teamId }) =>
  new Endpoint(api.team.delete, { variables: { id: teamId } }).execute();

export const inviteUser = ({ teamId, userId, role }) =>
  new Endpoint(api.team.invite, { variables: { id: teamId, userId, role } }).execute();

export const acceptInvite = ({ teamId }) =>
  new Endpoint(api.team.acceptInvite, { variables: { id: teamId } }).execute();

export const declineInvite = ({ teamId }) =>
  new Endpoint(api.team.declineInvite, { variables: { id: teamId } }).execute();

export const updateRole = ({ teamId, userId, role }) =>
  new Endpoint(api.team.updateRole, { variables: { id: teamId, userId, role } }).execute();

export const removeUser = ({ teamId, userId }) =>
  new Endpoint(api.team.removeMember, { variables: { id: teamId, userId } }).execute();
