/**
 * Global Search Type Definitions
 *
 * This file defines all the types for the guided search functionality
 */

export const SearchType = {
  FIND_A_CHALLENGE: 'Look for a challenge',
  FIND_A_TASK: 'Look for a task',
  FIND_A_PROJECT: 'Look for a project',
  FIND_A_MAPROULETTE_ID: 'Look for a MapRoulette ID',
  FIND_A_MAPROULETTE_FEATURE_BY_NAME: 'Look for a MapRoulette feature by name',
  FIND_A_TASK_COMMENT: 'Look for a task comment',
  FIND_A_CHALLENGE_COMMENT: 'Look for a challenge comment',
} as const

export type SearchType = (typeof SearchType)[keyof typeof SearchType]
