import type { components } from './openApiTypes'

/**
 * A team-owned challenge display image. Members request one; a super admin
 * approves it; from then on any member of that team can attach it to their
 * challenges.
 */
export type TeamImageStatus = 'pending' | 'approved' | 'rejected'

/** Matches the backend's org.maproulette.framework.model.TeamImage status constants. */
export const TEAM_IMAGE_STATUS_PENDING = 0
export const TEAM_IMAGE_STATUS_APPROVED = 1
export const TEAM_IMAGE_STATUS_REJECTED = 2

/**
 * `statusName` and `url` are added to the generated schema rather than taken
 * from it: the backend writes both (see `TeamImage.writes`), but the API spec
 * declares neither, so they would be missing from the schema type.
 */
export type TeamImage = components['schemas']['org.maproulette.framework.model.TeamImage'] & {
  statusName: TeamImageStatus | string
  /** Root-relative path serving the bytes; resolve with `resolveChallengeImageUrl`. */
  url: string
}

export const isPendingImage = (image: Pick<TeamImage, 'status'>): boolean =>
  image.status === TEAM_IMAGE_STATUS_PENDING

export const isApprovedImage = (image: Pick<TeamImage, 'status'>): boolean =>
  image.status === TEAM_IMAGE_STATUS_APPROVED
