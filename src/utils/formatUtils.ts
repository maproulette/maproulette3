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
export { initials as getInitials } from '@/utils/utils'

/**
 * Calculate account age in days
 */
/**
 * Format epoch timestamp to short date (MM/DD/YY)
 */
export const formatShortDate = (epoch: number): string => {
  const date = new Date(epoch)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear().toString().slice(-2)
  return `${month}/${day}/${year}`
}

/**
 * Calculate account age in days
 */
export const getAccountAge = (created: number): number => {
  // API returns epoch in seconds, convert to milliseconds if needed
  const createdMs = created < 10000000000 ? created * 1000 : created
  return Math.floor((Date.now() - createdMs) / (1000 * 60 * 60 * 24))
}
