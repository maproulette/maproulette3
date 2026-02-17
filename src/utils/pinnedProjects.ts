import type { User } from '@/types/User'

const MR4_APP_ID = 'mr4'
const PINNED_KEY = 'pinned'
const PROJECTS_KEY = 'projects'
const CHALLENGES_KEY = 'challenges'

function getPinned(user: User | null | undefined): Record<string, unknown> {
  const props = parseUserProperties(user)
  const settings = props[MR4_APP_ID] as Record<string, unknown> | undefined
  const pinned = (settings?.settings as Record<string, unknown> | undefined)?.[PINNED_KEY]
  return (pinned as Record<string, unknown>) ?? {}
}

function parseUserProperties(user: User | null | undefined): Record<string, unknown> {
  if (!user?.properties) return {}
  try {
    const parsed =
      typeof user.properties === 'string' ? JSON.parse(user.properties) : user.properties
    return (parsed as Record<string, unknown>) ?? {}
  } catch {
    return {}
  }
}

export function getPinnedProjectIds(user: User | null | undefined): number[] {
  const ids = getPinned(user)?.[PROJECTS_KEY]
  return Array.isArray(ids) ? ids.filter((id): id is number => typeof id === 'number') : []
}

export function getPinnedChallengeIds(user: User | null | undefined): number[] {
  const ids = getPinned(user)?.[CHALLENGES_KEY]
  return Array.isArray(ids) ? ids.filter((id): id is number => typeof id === 'number') : []
}

function withPinned(
  user: User | null | undefined,
  update: (pinned: Record<string, unknown>) => Record<string, unknown>
): Record<string, unknown> {
  const existing = parseUserProperties(user)
  const mr4 = (existing[MR4_APP_ID] as Record<string, unknown> | undefined) ?? {}
  const settings = (mr4.settings as Record<string, unknown> | undefined) ?? {}
  const pinned = (settings[PINNED_KEY] as Record<string, unknown> | undefined) ?? {}
  return {
    ...existing,
    [MR4_APP_ID]: {
      ...mr4,
      settings: {
        ...settings,
        [PINNED_KEY]: update(pinned),
      },
    },
  }
}

export function buildPropertiesWithPinnedProjects(
  user: User | null | undefined,
  pinnedProjectIds: number[]
): Record<string, unknown> {
  return withPinned(user, (pinned) => ({ ...pinned, [PROJECTS_KEY]: pinnedProjectIds }))
}

export function buildPropertiesWithPinnedChallenges(
  user: User | null | undefined,
  pinnedChallengeIds: number[]
): Record<string, unknown> {
  return withPinned(user, (pinned) => ({ ...pinned, [CHALLENGES_KEY]: pinnedChallengeIds }))
}
