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
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Calculate account age in days
 */
export const getAccountAge = (created: number): number => {
  return Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24))
}
