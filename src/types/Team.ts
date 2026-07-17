import type { components } from './openApiTypes'

export type Team = components['schemas']['org.maproulette.framework.model.Group']
export type TeamUser = components['schemas']['org.maproulette.framework.model.TeamUser']

export type TeamRole = 0 | 1 | 2

export const TeamRoleLabel: Record<TeamRole, string> = {
  0: 'Invited',
  1: 'Member',
  2: 'Admin',
}
