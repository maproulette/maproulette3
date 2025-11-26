import type { components, operations, paths } from './openApiTypes'

/* Responses */
export type PreferredChallengesResponse =
  paths['/challenges/preferred']['get']['responses']['200']['content']['application/json']
export type FeaturedChallengesResponse =
  components['schemas']['org.maproulette.framework.model.BaseChallenge']
export type ChallengeGetResponse =
  paths['/challenge/{id}']['get']['responses']['200']['content']['application/json']

export type ChallengeTaskMarkersResponse =
  paths['/challenge/{id}/taskMarkers']['get']['responses']['200']['content']['application/json']

/*  Parameters  */
export type PreferredChallengesParams =
  operations['challenge_preferred_challenges']['parameters']['query']
export type FeaturedChallengesParams =
  operations['challenge_featured_challenges']['parameters']['query']
export type ChallengeGetParams = operations['challenge_read']['parameters']['path']
export type ChallengeTaskMarkersParams = operations['challenge_task_markers']['parameters']['path']
export type ExploreChallengesParams =
  operations['explore_challenge_list_challenges']['parameters']['query']

/* Types From API */
export type Challenge = components['schemas']['org.maproulette.framework.model.BaseChallenge']

/* Custom Types */
export type ExtendedFindParamsSortBy = 'name' | 'created' | 'modified' | 'popularity' | 'difficulty'
