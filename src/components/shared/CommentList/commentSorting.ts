import type { Comment } from '@/types/Comment'

export const sortComments = (comments: Comment[], orderBy: 'asc' | 'desc'): Comment[] => {
  const sign = orderBy === 'asc' ? 1 : -1
  return [...comments].sort((a, b) => ((a.created ?? 0) - (b.created ?? 0)) * sign)
}
