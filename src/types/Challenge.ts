import type { paths } from './api'

export type Challenge =
  paths['/challenge/{id}']['get']['responses']['200']['content']['application/json']

export type ChallengesList =
  paths['/challenges']['get']['responses']['200']['content']['application/json']

export type ExploreChallenges =
  paths['/challenges/exploreChallenges']['get']['responses']['200']['content']['application/json']

export type ExtendedFindParamsSortBy = 'name' | 'created' | 'modified' | 'popularity' | 'difficulty'

/**
 * Represents geographical bounds as a tuple of coordinates
 * @description [left, bottom, right, top] - longitude and latitude bounds for a map area
 */
export type MapBounds = [left: number, bottom: number, right: number, top: number]

export type ExtendedFindParams = {
  global: boolean
  bounds: MapBounds | null
  sortBy: ExtendedFindParamsSortBy
  limit: number
}

export type ExploreChallengesParams = {
  global: boolean
  bounds: MapBounds | null
  sortBy: ExtendedFindParamsSortBy
  limit: number
}

export interface ChallengeActivity {
  date: string
  status: number
  statusName: string
  count: number
}

export interface ChallengeStats {
  id: number
  name: string
  actions: {
    total: number
    available: number
    fixed: number
    falsePositive: number
    skipped: number
    deleted: number
    alreadyFixed: number
    tooHard: number
    answered: number
    validated: number
    disabled: number
    avgTimeSpent: number
    tasksWithTime: number
  }
  priorityActions: {
    [key: string]: {
      total: number
      available: number
      fixed: number
      falsePositive: number
      skipped: number
      deleted: number
      alreadyFixed: number
      tooHard: number
      answered: number
      validated: number
      disabled: number
      avgTimeSpent: number
      tasksWithTime: number
    }
  }
}

export interface ChallengeData {
  id: number
  name: string
  actions: {
    total: number
    available: number
    fixed: number
    falsePositive: number
    skipped: number
    deleted: number
    alreadyFixed: number
    tooHard: number
    answered: number
    validated: number
    disabled: number
    avgTimeSpent: number
    tasksWithTime: number
  }
}
