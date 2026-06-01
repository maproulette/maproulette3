/**
 * Global Search Type Definitions
 *
 * This file defines all the types for the guided search functionality
 */

import type { Challenge, ExploreChallengesParams } from './Challenge'
import type { Project } from './Project'
import type { Task } from './Task'

export interface NoSearchState {
  searchType: null
  appliedFilters: null
}

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

export interface ExploreChallengesSearchState {
  searchType: typeof SearchType.FIND_A_CHALLENGE
  appliedFilters: ExploreChallengesParams
}

export interface FindATaskSearchState {
  searchType: typeof SearchType.FIND_A_TASK
  appliedFilters: null
}

export interface FindAProjectSearchState {
  searchType: typeof SearchType.FIND_A_PROJECT
  appliedFilters: null
}

export interface FindAMapRouletteIdSearchState {
  searchType: typeof SearchType.FIND_A_MAPROULETTE_ID
  appliedFilters: null
}

export interface FindAMapRouletteFeatureByNameSearchState {
  searchType: typeof SearchType.FIND_A_MAPROULETTE_FEATURE_BY_NAME
  appliedFilters: null
}

export interface FindATaskCommentSearchState {
  searchType: typeof SearchType.FIND_A_TASK_COMMENT
  appliedFilters: null
}

export interface FindAChallengeCommentSearchState {
  searchType: typeof SearchType.FIND_A_CHALLENGE_COMMENT
  appliedFilters: null
}

export type SearchState =
  | NoSearchState
  | ExploreChallengesSearchState
  | FindATaskSearchState
  | FindAProjectSearchState
  | FindAMapRouletteIdSearchState
  | FindAMapRouletteFeatureByNameSearchState
  | FindATaskCommentSearchState
  | FindAChallengeCommentSearchState

export type NoSearchResults = {
  linkWithFilters: null
  searchResults: null
}

export type FindAChallengeResults = {
  linkWithFilters: string
  searchResults: Challenge[]
}

export type FindATaskResults = {
  searchResults: Task[]
}

export type FindAProjectResults = {
  searchResults: Project[]
}

export type FindAMapRouletteIdResults = {
  searchResults: null
}

export type FindAMapRouletteFeatureByNameResults = {
  searchResults: null
}

export type FindATaskCommentResults = {
  searchResults: null
}

export type FindAChallengeCommentResults = {
  searchResults: null
}

export type GlobalSearchResults =
  | NoSearchResults
  | FindAChallengeResults
  | FindATaskResults
  | FindAProjectResults
  | FindAMapRouletteIdResults
  | FindAMapRouletteFeatureByNameResults
  | FindATaskCommentResults
  | FindAChallengeCommentResults
