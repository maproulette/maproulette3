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
