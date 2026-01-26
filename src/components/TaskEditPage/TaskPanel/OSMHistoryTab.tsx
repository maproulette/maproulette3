import { ExternalLink, GitCommit, Info, MapPin } from 'lucide-react'
import type { Task } from '@/types/Task'

interface OSMHistoryTabProps {
  task: Task
}

export const OSMHistoryTab = ({ task }: OSMHistoryTabProps) => {
  const changesetId = task.changesetId
  const hasChangeset = changesetId && changesetId > 0

  // Parse task location to get coordinates for history link
  let coordinates: { lat: number; lng: number } | null = null
  if (task.location) {
    try {
      const location = typeof task.location === 'string' ? JSON.parse(task.location) : task.location
      if (location.type === 'Point' && Array.isArray(location.coordinates)) {
        const [lng, lat] = location.coordinates
        if (typeof lat === 'number' && typeof lng === 'number') {
          coordinates = { lat, lng }
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return (
    <div className="space-y-4">
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
                href={`https://www.openstreetmap.org/changeset/${changesetId}`}
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
              href={`https://www.openstreetmap.org/history#map=17/${coordinates.lat}/${coordinates.lng}`}
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
              {task.created
                ? new Date(task.created * 1000).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Unknown'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Last Modified</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {task.modified
                ? new Date(task.modified * 1000).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Unknown'}
            </span>
          </div>
          {task.mappedOn && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Completed</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {new Date(task.mappedOn * 1000).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
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
