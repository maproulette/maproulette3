import { challengeComments } from './comments'
import { challengeExplore } from './explore'
import { challengeFavorites } from './favorites'
import { challengeLikes } from './likes'
import { challengeReport } from './report'
import { challengeSingle } from './single'

export const challenge = {
  ...challengeSingle,
  ...challengeExplore,
  ...challengeFavorites,
  ...challengeLikes,
  ...challengeComments,
  ...challengeReport,
}
