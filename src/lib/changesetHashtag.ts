/**
 * During the MR4 public beta, append a hashtag to changeset comments so we can
 * tell whether a changeset originated from maproulette3 or maproulette4. This
 * is temporary and should be removed once MR4 becomes the only frontend.
 */

export const MR4_BETA_HASHTAG = '#maproulette-beta'

/**
 * Append the MR4 beta hashtag to a changeset comment. If the comment is empty
 * the hashtag stands on its own; if it already contains the hashtag the
 * comment is returned unchanged.
 */
export const appendBetaHashtag = (comment: string): string => {
  if (!comment) return MR4_BETA_HASHTAG
  if (comment.includes(MR4_BETA_HASHTAG)) return comment
  return `${comment} ${MR4_BETA_HASHTAG}`
}
