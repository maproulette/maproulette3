export const formatDate = (date: number | string | undefined | null): string => {
  if (!date) return 'Unknown'

  try {
    if (typeof date === 'number') {
      const timestamp = date < 10000000000 ? date * 1000 : date
      return new Date(timestamp).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  } catch {
    // Ignore parse errors
  }

  return 'Unknown'
}
