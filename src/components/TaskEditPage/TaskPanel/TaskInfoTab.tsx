import {
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Flag,
  Gauge,
  Hash,
  ListTodo,
  MapPin,
  Package,
  Star,
  User,
  ZoomIn,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/Task'
import { getDifficultyLabel } from '@/utils/difficultyLevelData'
import { useChallengeContext } from '../contexts/ChallengeContext'
import { useTaskMapContext } from '../contexts/TaskMapContext'

interface TaskInfoTabProps {
  task: Task
  isPrimaryTask: boolean
  canAddToBundle?: boolean
  onAddToBundle?: () => void
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Created',
  1: 'Fixed',
  2: 'False Positive',
  3: 'Skipped',
  4: 'Deleted',
  5: 'Already Fixed',
  6: 'Too Hard',
}

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-zinc-500',
  1: 'bg-green-500',
  2: 'bg-red-500',
  3: 'bg-yellow-500',
  4: 'bg-zinc-400',
  5: 'bg-blue-500',
  6: 'bg-orange-500',
}

const parseTaskLocation = (task: Task): { lat: number; lng: number } | null => {
  if (!task.location) return null

  try {
    const location = typeof task.location === 'string' ? JSON.parse(task.location) : task.location

    if (location.type === 'Point' && Array.isArray(location.coordinates)) {
      const [lng, lat] = location.coordinates
      if (typeof lat === 'number' && typeof lng === 'number') {
        return { lat, lng }
      }
    }
  } catch (error) {
    console.error('Failed to parse task location:', error)
  }

  return null
}

const parseTaskProperties = (task: Task): Record<string, unknown> | null => {
  if (!task.geometries) return null

  try {
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    if (geometries.type === 'FeatureCollection' && geometries.features?.length > 0) {
      return geometries.features[0]?.properties || null
    } else if (geometries.type === 'Feature') {
      return geometries.properties || null
    }
  } catch (error) {
    console.error('Failed to parse task geometries:', error)
  }

  return null
}

const calculateGeometryBounds = (task: Task): [[number, number], [number, number]] | null => {
  if (!task.geometries) return null

  try {
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    let minLng = Infinity
    let maxLng = -Infinity
    let minLat = Infinity
    let maxLat = -Infinity

    const processCoordinates = (coords: unknown): void => {
      if (Array.isArray(coords)) {
        if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          const [lng, lat] = coords
          if (Number.isFinite(lng) && Number.isFinite(lat)) {
            minLng = Math.min(minLng, lng)
            maxLng = Math.max(maxLng, lng)
            minLat = Math.min(minLat, lat)
            maxLat = Math.max(maxLat, lat)
          }
        } else {
          coords.forEach(processCoordinates)
        }
      }
    }

    const processGeometry = (geom: { type: string; coordinates?: unknown }) => {
      if (geom.coordinates) {
        processCoordinates(geom.coordinates)
      }
    }

    if (geometries.type === 'FeatureCollection' && geometries.features) {
      geometries.features.forEach(
        (feature: { geometry?: { type: string; coordinates?: unknown } }) => {
          if (feature.geometry) {
            processGeometry(feature.geometry)
          }
        }
      )
    } else if (geometries.type === 'Feature' && geometries.geometry) {
      processGeometry(geometries.geometry)
    } else if (geometries.coordinates) {
      processGeometry(geometries)
    }

    if (
      !Number.isFinite(minLng) ||
      !Number.isFinite(maxLng) ||
      !Number.isFinite(minLat) ||
      !Number.isFinite(maxLat)
    ) {
      return null
    }

    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ]
  } catch (error) {
    console.error('Failed to calculate geometry bounds:', error)
    return null
  }
}

export const TaskInfoTab = ({
  task,
  isPrimaryTask,
  canAddToBundle,
  onAddToBundle,
}: TaskInfoTabProps) => {
  const { challenge } = useChallengeContext()
  const { map, markersHidden, setMarkersHidden } = useTaskMapContext()

  const { data: challengeStats } = api.challenge.getChallengeStats(challenge?.id ?? 0)

  const location = parseTaskLocation(task)
  const properties = parseTaskProperties(task)
  const status = task.status ?? 0
  const statusLabel = STATUS_LABELS[status] || 'Unknown'
  const statusColor = STATUS_COLORS[status] || 'bg-zinc-500'

  const stats = challengeStats?.[0]?.actions
  const tasksRemaining = stats?.available ?? challenge?.tasksRemaining ?? 0
  const totalTasks = stats?.total ?? 0
  const completionPercentage =
    challenge?.completionPercentage ??
    (totalTasks > 0 ? Math.round(((totalTasks - tasksRemaining) / totalTasks) * 100) : 0)

  const handleZoomToTask = () => {
    if (!map?.current) return

    const bounds = calculateGeometryBounds(task)
    if (bounds) {
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
        maxZoom: 18,
      })
    } else if (location) {
      map.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 16,
        duration: 1000,
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Primary Task Indicator */}
      {isPrimaryTask && (
        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-2 dark:from-amber-950/30 dark:to-amber-900/20">
          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
          <span className="font-medium text-sm text-amber-700 dark:text-amber-400">
            Primary Task
          </span>
        </div>
      )}

      {/* Task Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-lg text-zinc-900 leading-tight dark:text-zinc-50">
              {task.name || `Task #${task.id}`}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Hash className="h-3 w-3" />
              <span>ID: {task.id}</span>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1 font-medium text-xs text-white',
              statusColor
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
            {statusLabel}
          </div>
        </div>

        {/* Task Meta Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {task.mappedOn && (
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800/50">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">Completed</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {new Date(task.mappedOn * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800/50">
              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">Location</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              </div>
            </div>
          )}
          {task.completedBy && (
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800/50">
              <User className="h-3.5 w-3.5 text-zinc-500" />
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">Completed By</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  User #{task.completedBy}
                </div>
              </div>
            </div>
          )}
          {task.changesetId && (
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800/50">
              <Flag className="h-3.5 w-3.5 text-zinc-500" />
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">Changeset</div>
                <a
                  href={`https://www.openstreetmap.org/changeset/${task.changesetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  #{task.changesetId}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {canAddToBundle && onAddToBundle && (
          <Button
            onClick={onAddToBundle}
            variant="outline"
            size="sm"
            className="w-full border-green-500/50 bg-green-50 text-green-700 shadow-sm transition-all hover:border-green-500 hover:bg-green-100 hover:shadow-md dark:border-green-600/50 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50"
          >
            <Package className="mr-2 h-3.5 w-3.5" />
            Add to Bundle
          </Button>
        )}

        <Button
          onClick={() => setMarkersHidden(!markersHidden)}
          variant="outline"
          size="sm"
          className={`w-full shadow-sm transition-all hover:shadow-md ${
            markersHidden
              ? 'border-amber-500/50 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-100 dark:border-amber-600/50 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50'
              : 'border-zinc-300/50 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          {markersHidden ? (
            <>
              <Eye className="mr-2 h-3.5 w-3.5" />
              Show Markers
            </>
          ) : (
            <>
              <EyeOff className="mr-2 h-3.5 w-3.5" />
              Hide Markers
            </>
          )}
        </Button>

        {(task.geometries || location) && (
          <Button
            onClick={handleZoomToTask}
            variant="outline"
            size="sm"
            className="w-full border-purple-500/50 bg-purple-50 text-purple-700 shadow-sm transition-all hover:border-purple-500 hover:bg-purple-100 hover:shadow-md dark:border-purple-600/50 dark:bg-purple-950/30 dark:text-purple-400 dark:hover:bg-purple-950/50"
          >
            <ZoomIn className="mr-2 h-3.5 w-3.5" />
            Zoom to Task
          </Button>
        )}
      </div>

      {/* Instructions */}
      {challenge?.instruction && (
        <div>
          <h3 className="mb-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Instructions
          </h3>
          <div className="markdown-content text-sm text-zinc-700 leading-relaxed dark:text-zinc-300 [&_a]:text-blue-600 [&_a]:hover:underline [&_a]:dark:text-blue-400 [&_blockquote]:my-2 [&_blockquote]:border-zinc-300 [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:dark:border-zinc-600 [&_code]:rounded [&_code]:bg-zinc-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:dark:bg-zinc-800 [&_li]:my-1 [&_ol]:my-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_p]:my-2 [&_p]:first:mt-0 [&_ul]:my-2 [&_ul]:ml-4 [&_ul]:list-disc">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  />
                ),
              }}
            >
              {challenge.instruction}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Challenge Stats */}
      <div>
        <h3 className="mb-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
          Challenge Stats
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-zinc-100 p-2.5 text-center dark:bg-zinc-800/50">
            <Gauge className="mx-auto mb-1 h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {getDifficultyLabel(challenge?.difficulty ?? 1)}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Difficulty
            </div>
          </div>
          <div className="rounded-lg bg-zinc-100 p-2.5 text-center dark:bg-zinc-800/50">
            <ListTodo className="mx-auto mb-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {tasksRemaining.toLocaleString()}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Remaining
            </div>
          </div>
          <div className="rounded-lg bg-zinc-100 p-2.5 text-center dark:bg-zinc-800/50">
            <CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-green-600 dark:text-green-400" />
            <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {completionPercentage}%
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Complete
            </div>
          </div>
        </div>
      </div>

      {/* Properties */}
      {properties && Object.keys(properties).length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Feature Properties
          </h3>
          <div className="space-y-1">
            {Object.entries(properties).map(([key, value]) => (
              <div
                key={key}
                className="flex items-start justify-between gap-2 rounded bg-zinc-100 px-2 py-1.5 text-xs dark:bg-zinc-800/50"
              >
                <span className="font-medium text-zinc-600 dark:text-zinc-400">{key}</span>
                <span className="text-right text-zinc-900 dark:text-zinc-100">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
