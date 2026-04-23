import type { Comment } from '@/types/Comment'

export const sortComments = (comments: Comment[], orderBy: 'asc' | 'desc'): Comment[] => {
  const sign = orderBy === 'asc' ? 1 : -1
  return [...comments].sort((a, b) => {
    const aTime = typeof a.created === 'number' ? a.created : Date.parse(String(a.created))
    const bTime = typeof b.created === 'number' ? b.created : Date.parse(String(b.created))
    return (aTime - bTime) * sign
  })
}
