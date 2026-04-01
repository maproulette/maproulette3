/**
 * Format a date value to a readable short date string (e.g. "Apr 1, 2026").
 * Accepts epoch timestamps (seconds or milliseconds), ISO strings, or Date objects.
 * Returns the fallback string if the input is missing or unparseable.
 */
export const formatDate = (
  date: number | string | Date | undefined | null,
  fallback = '--'
): string => {
  if (date == null) return fallback

  try {
    const d =
      typeof date === 'number' ? new Date(date < 10000000000 ? date * 1000 : date) : new Date(date)

    if (Number.isNaN(d.getTime())) return fallback

    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return fallback
  }
}

/**
 * Format a date value to a short date + time string (e.g. "Apr 1, 2:30 PM").
 * Useful for comment timestamps and activity feeds.
 */
export const formatDateTime = (
  date: number | string | Date | undefined | null,
  fallback = '--'
): string => {
  if (date == null) return fallback

  try {
    const d =
      typeof date === 'number' ? new Date(date < 10000000000 ? date * 1000 : date) : new Date(date)

    if (Number.isNaN(d.getTime())) return fallback

    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return fallback
  }
}
