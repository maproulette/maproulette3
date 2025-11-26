import type { TaskMarker } from '@/types/Task'

/**
 * Configuration for data chunking
 */
export const CHUNK_CONFIG = {
  targetSize: 10000,

  minSize: 5000,
}

/**
 * Splits task markers into geographic chunks based on latitude bands
 * This creates more balanced chunks that align with typical map viewing patterns
 */
export const createGeographicChunks = (
  taskMarkers: TaskMarker[],
  numChunks: number
): TaskMarker[][] => {
  if (taskMarkers.length === 0) return []
  if (numChunks <= 1) return [taskMarkers]

  const sorted = [...taskMarkers].sort((a, b) => a.location.lat - b.location.lat)

  const chunks: TaskMarker[][] = Array.from({ length: numChunks }, () => [])
  const minLat = sorted[0].location.lat
  const maxLat = sorted[sorted.length - 1].location.lat
  const latRange = maxLat - minLat

  sorted.forEach((task) => {
    const normalizedLat = (task.location.lat - minLat) / (latRange || 1)
    const chunkIndex = Math.min(Math.floor(normalizedLat * numChunks), numChunks - 1)
    chunks[chunkIndex].push(task)
  })

  return chunks.filter((chunk) => chunk.length > 0)
}

/**
 * Splits task markers into simple equal-sized chunks
 * Faster than geographic chunking but may be less optimal for map viewing
 */
export const createSimpleChunks = (
  taskMarkers: TaskMarker[],
  chunkSize: number
): TaskMarker[][] => {
  const chunks: TaskMarker[][] = []

  for (let i = 0; i < taskMarkers.length; i += chunkSize) {
    chunks.push(taskMarkers.slice(i, i + chunkSize))
  }

  return chunks
}

/**
 * Determines optimal chunking strategy and creates chunks
 * Uses simple chunking for speed - geographic chunking is too slow for large datasets
 */
export const createOptimalChunks = (taskMarkers: TaskMarker[]): TaskMarker[][] => {
  const totalTasks = taskMarkers.length

  if (totalTasks <= CHUNK_CONFIG.targetSize) {
    return [taskMarkers]
  }

  return createSimpleChunks(taskMarkers, CHUNK_CONFIG.targetSize)
}

/**
 * Creates chunk identifiers for sources and layers
 */
export const getChunkIds = (baseId: string, chunkIndex: number) => ({
  source: `${baseId}-chunk-${chunkIndex}`,
  clusters: `${baseId}-clusters-chunk-${chunkIndex}`,
  clusterCount: `${baseId}-cluster-count-chunk-${chunkIndex}`,
  points: `${baseId}-points-chunk-${chunkIndex}`,
})
