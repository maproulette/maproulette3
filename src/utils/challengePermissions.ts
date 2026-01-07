import type { Challenge } from '@/types/Challenge'
import type { User } from '@/types/User'

export const canManageChallenge = (
  user: User | null | undefined,
  challenge: Challenge | null | undefined
): boolean => {
  if (!user || !challenge) return false

  if (user.id === challenge.owner) return true

  const isSuperUser = user.grants?.some((grant) => grant.role === -1) ?? false
  if (isSuperUser) return true

  return false
}
