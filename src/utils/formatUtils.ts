/**
 * Utility functions for formatting data
 */

/**
 * Format epoch timestamp to readable date
 */
export const formatDate = (epoch: number): string => {
  // API returns epoch in seconds, convert to milliseconds if needed
  const epochMs = epoch < 10000000000 ? epoch * 1000 : epoch
  return new Date(epochMs).toLocaleDateString('en-US', {
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
  // API returns epoch in seconds, convert to milliseconds if needed
  const createdMs = created < 10000000000 ? created * 1000 : created
  return Math.floor((Date.now() - createdMs) / (1000 * 60 * 60 * 24))
}
