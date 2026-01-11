/**
 * Utility functions for formatting data
 */

/**
 * Format epoch timestamp to readable date
 */
export const formatDate = (epoch: number): string => {
  return new Date(epoch).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get initials from a name
 * Re-exported from lib/utils for consistency
 */
export { initials as getInitials } from '@/lib/utils'

/**
 * Calculate account age in days
 */
export const getAccountAge = (created: number): number => {
  return Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24))
}
