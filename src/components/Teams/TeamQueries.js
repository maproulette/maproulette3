import { gql } from '@apollo/client'

const TEAM_USER_FIELDS = gql`
  fragment TeamUserFields on TeamUser {
    id
    userId
    name
    status
    teamGrants {
      id
      role
    }
  }
`

export const MY_TEAMS = gql`
  query MyTeams($userId: Long!) {
    userTeams(id: $userId) {
      id
      userId
      status
      teamGrants {
        id
        role
      }
      team {
        id
        name
        description
        teamUsers { ...TeamUserFields }
      }
    }
  }

  ${TEAM_USER_FIELDS}
`

export const TEAM_USERS = gql`
  query TeamUsers($teamId: Long!) {
    teamUsers(id: $teamId) {
      ...TeamUserFields
      team {
        id
      }
    }
  }

  ${TEAM_USER_FIELDS}
`

export const CREATE_TEAM = gql`
  mutation CreateTeam($name: String!, $description: String!) {
    createTeam(name: $name, description: $description) {
      id
      name
      description
    }
  }
`

export const UPDATE_TEAM = gql`
  mutation UpdateTeam($id: Long!, $name: String, $description: String) {
    updateTeam(id: $id, name: $name, description: $description) {
      id
      name
      description
    }
  }
`

export const INVITE_USER = gql`
  mutation InviteUser($teamId: Long!, $userId: Long!, $role: Int!) {
    inviteTeamUser(id: $teamId, userId: $userId, role: $role) {
      id
    }
  }
`

export const ACCEPT_INVITE = gql`
  mutation AcceptInvite($teamId: Long!) {
    acceptTeamInvite(id: $teamId) {
      id
    }
  }
`

export const DECLINE_INVITE = gql`
  mutation DeclineInvite($teamId: Long!) {
    declineTeamInvite(id: $teamId) 
  }
`

export const UPDATE_ROLE = gql`
  mutation UpdateRole($teamId: Long!, $userId: Long!, $role: Int!) {
    updateMemberRole(id: $teamId, userId: $userId, role: $role) {
      id
    }
  }
`

export const REMOVE_USER = gql`
  mutation RemoveUser($teamId: Long!, $userId: Long!) {
    removeTeamUser(id: $teamId, userId: $userId)
  }
`

export const DELETE_TEAM = gql`
  mutation DeleteTeam($teamId: Long!) {
    deleteTeam(id: $teamId) 
  }
`
