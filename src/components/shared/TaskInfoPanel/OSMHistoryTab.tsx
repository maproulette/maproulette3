import { Box, ExternalLink, GitCommit, History, Info, Loader2, MapPin, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/api'
import type { OSMHistoryElement } from '@/api/osm'
import type { Task } from '@/types/Task'

interface OSMHistoryTabProps {
  task: Task
}

// Get OSM server URL from environment (supports test vs production)
export const getOsmServerUrl = () => {
  return import.meta.env.VITE_OSM_SERVER || 'https://www.openstreetmap.org'
}

// Parse OSM feature info from task properties (e.g., @id: "way/123456")
export interface OsmFeature {
  type: 'node' | 'way' | 'relation'
  id: number
}

export const parseOsmFeatureFromTask = (task: Task): OsmFeature | null => {
  if (!task.geometries) return null

  try {
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    // Check FeatureCollection
    if (geometries.type === 'FeatureCollection' && geometries.features?.length > 0) {
      const properties = geometries.features[0]?.properties
      if (properties) {
        // Look for @id (standard OSM property)
        const osmId = properties['@id'] || properties.id || properties.osm_id
        if (osmId && typeof osmId === 'string') {
          const match = osmId.match(/^(node|way|relation)\/(\d+)$/)
          if (match) {
            return { type: match[1] as 'node' | 'way' | 'relation', id: parseInt(match[2], 10) }
          }
        }
        // Look for separate osm_type and osm_id properties
        const osmType = properties['@type'] || properties.osm_type
        const numericId = properties.osm_id || properties['@osmId']
        if (osmType && numericId) {
          const type = String(osmType).toLowerCase()
          if (type === 'node' || type === 'way' || type === 'relation') {
            return { type, id: Number(numericId) }
          }
        }
      }
    } else if (geometries.type === 'Feature' && geometries.properties) {
      const properties = geometries.properties
      const osmId = properties['@id'] || properties.id || properties.osm_id
      if (osmId && typeof osmId === 'string') {
        const match = osmId.match(/^(node|way|relation)\/(\d+)$/)
        if (match) {
          return { type: match[1] as 'node' | 'way' | 'relation', id: parseInt(match[2], 10) }
        }
      }
    }
  } catch {
    // Ignore parse errors
  }

  return null
}

// Parse coordinates from task location
const parseCoordinates = (task: Task): { lat: number; lng: number } | null => {
  if (!task.location) return null

  try {
    const location = typeof task.location === 'string' ? JSON.parse(task.location) : task.location
    if (location.type === 'Point' && Array.isArray(location.coordinates)) {
      const [lng, lat] = location.coordinates
      if (typeof lat === 'number' && typeof lng === 'number') {
        return { lat, lng }
      }
    }
  } catch {
    // Ignore parse errors
  }

  return null
}

// Format date - handles both epoch timestamps and ISO date strings
const formatDate = (date: number | string | undefined | null): string => {
  if (!date) return 'Unknown'

  try {
    // If it's a number, treat as epoch (seconds or milliseconds)
    if (typeof date === 'number') {
      // If the number is too small, it's likely seconds, not milliseconds
      const timestamp = date < 10000000000 ? date * 1000 : date
      return new Date(timestamp).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    // If it's a string, parse it directly
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

export const OSMHistoryTab = ({ task }: OSMHistoryTabProps) => {
  const changesetId = task.changesetId
  const hasChangeset = changesetId && changesetId > 0
  const osmServer = api.osm.getOSMServerUrl()
  const osmFeature = parseOsmFeatureFromTask(task)
  const coordinates = parseCoordinates(task)

  // State for element history
  const [elementHistory, setElementHistory] = useState<OSMHistoryElement[] | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  // Fetch element history when osmFeature is available
  useEffect(() => {
    if (!osmFeature) return

    const fetchHistory = async () => {
      setHistoryLoading(true)
      setHistoryError(null)
      try {
        const idString = `${osmFeature.type}/${osmFeature.id}`
        const history = await api.osm.fetchOSMElementHistory(idString, true)
        setElementHistory(history)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch history'
        setHistoryError(message)
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [osmFeature?.type, osmFeature?.id])

  return (
    <div className="space-y-4">
      {/* OSM Feature Link */}
      {osmFeature ? (
        <>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-zinc-100">
              <Box className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              OSM Feature
            </div>
            <div className="mt-3">
              <a
                href={`${osmServer}/${osmFeature.type}/${osmFeature.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
              >
                <div>
                  <div className="font-medium text-blue-600 dark:text-blue-400">
                    {osmFeature.type}/{osmFeature.id}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    View {osmFeature.type} on OpenStreetMap
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-400" />
              </a>
            </div>
          </div>

          {/* Element History */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-zinc-100">
              <History className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Element History
            </div>

            {historyLoading && (
              <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading history...
              </div>
            )}

            {historyError && (
              <div className="mt-3 text-red-600 text-sm dark:text-red-400">{historyError}</div>
            )}

            {elementHistory && elementHistory.length > 0 && (
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                {elementHistory
                  .slice()
                  .reverse()
                  .map((entry) => {
                    const changesetData =
                      typeof entry.changeset === 'object' ? entry.changeset : null
                    const changesetIdValue =
                      typeof entry.changeset === 'number' ? entry.changeset : changesetData?.id

                    return (
                      <div
                        key={entry.version}
                        className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-700">
                              v{entry.version}
                            </span>
                            {entry.visible === false && (
                              <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700 text-xs dark:bg-red-900/30 dark:text-red-400">
                                deleted
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(entry.timestamp).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-xs">
                          {entry.user && (
                            <a
                              href={api.osm.osmUserProfileURL(entry.user)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                            >
                              <User className="h-3 w-3" />
                              {entry.user}
                            </a>
                          )}
                          {changesetIdValue && (
                            <a
                              href={`${osmServer}/changeset/${changesetIdValue}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                            >
                              <GitCommit className="h-3 w-3" />
                              {changesetIdValue}
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}

            {elementHistory && elementHistory.length === 0 && (
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">No history available.</p>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-zinc-100">
            <Info className="h-4 w-4 text-zinc-500" />
            No OSM Feature Detected
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            This task's geometry does not contain OSM element identifiers (like @id: "way/12345").
            OSM feature history is only available when tasks reference specific OpenStreetMap
            elements.
          </p>
        </div>
      )}

      {/* Changeset Info */}
      {hasChangeset ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-zinc-100">
              <GitCommit className="h-4 w-4 text-green-600 dark:text-green-400" />
              Linked Changeset
            </div>
            <div className="mt-3 space-y-2">
              <a
                href={`${osmServer}/changeset/${changesetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
              >
                <div>
                  <div className="font-medium text-blue-600 dark:text-blue-400">
                    Changeset #{changesetId}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    View on OpenStreetMap
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-400" />
              </a>

              <a
                href={`https://osmcha.org/changesets/${changesetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
              >
                <div>
                  <div className="font-medium text-blue-600 dark:text-blue-400">View in OSMCha</div>
                  <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Detailed changeset analysis
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-400" />
              </a>

              <a
                href={`https://overpass-turbo.eu/?changeset=${changesetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
              >
                <div>
                  <div className="font-medium text-blue-600 dark:text-blue-400">
                    View in Overpass Turbo
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Query changeset data
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-400" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-zinc-100">
            <Info className="h-4 w-4 text-zinc-500" />
            No Changeset Linked
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            This task does not have an OSM changeset linked yet. A changeset will be automatically
            linked when the task is completed and the edits are saved to OpenStreetMap.
          </p>
        </div>
      )}

      {/* Location-based History Links */}
      {coordinates && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-zinc-100">
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Area History
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            View recent changes in the area around this task
          </p>
          <div className="mt-3 space-y-2">
            <a
              href={`${osmServer}/history#map=17/${coordinates.lat}/${coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
            >
              <div>
                <div className="font-medium text-blue-600 dark:text-blue-400">
                  OSM History at Location
                </div>
                <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Recent edits near {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-zinc-400" />
            </a>

            <a
              href={`https://osmcha.org/?filters=%7B%22in_bbox%22%3A%5B%7B%22label%22%3A%22${coordinates.lng - 0.01}%2C${coordinates.lat - 0.01}%2C${coordinates.lng + 0.01}%2C${coordinates.lat + 0.01}%22%2C%22value%22%3A%22${coordinates.lng - 0.01}%2C${coordinates.lat - 0.01}%2C${coordinates.lng + 0.01}%2C${coordinates.lat + 0.01}%22%7D%5D%7D`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
            >
              <div>
                <div className="font-medium text-blue-600 dark:text-blue-400">
                  OSMCha Area Filter
                </div>
                <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  All changesets in this area
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-zinc-400" />
            </a>
          </div>
        </div>
      )}

      {/* Task Metadata */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Task Timeline</div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Created</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatDate(task.created)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Last Modified</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatDate(task.modified)}
            </span>
          </div>
          {task.mappedOn && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Completed</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatDate(task.mappedOn)}
              </span>
            </div>
          )}
          {task.completedTimeSpent && task.completedTimeSpent > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Time Spent</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {Math.round(task.completedTimeSpent / 1000 / 60)} minutes
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
