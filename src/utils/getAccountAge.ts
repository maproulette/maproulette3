/**
 * Calculate account age in days
 */
export const getAccountAge = (created: number): number => {
  // API returns epoch in seconds, convert to milliseconds if needed
  const createdMs = created < 10000000000 ? created * 1000 : created
  return Math.floor((Date.now() - createdMs) / (1000 * 60 * 60 * 24))
}
