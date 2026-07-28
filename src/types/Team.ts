import type { components } from './openApiTypes'

export type Team = components['schemas']['org.maproulette.framework.model.Group']
export type TeamUser = components['schemas']['org.maproulette.framework.model.TeamUser']

export type TeamRole = 0 | 1 | 2

export const TeamRoleLabel: Record<TeamRole, string> = {
  0: 'Invited',
  1: 'Member',
  2: 'Admin',
}

const TEAM_ROLES: readonly TeamRole[] = [0, 1, 2]

/**
 * Narrows a generic backend `status` number to a valid `TeamRole`, returning
 * `undefined` if the value isn't one of the known roles instead of blindly
 * force-casting it.
 */
export const toTeamRole = (status: number): TeamRole | undefined =>
  TEAM_ROLES.includes(status as TeamRole) ? (status as TeamRole) : undefined
