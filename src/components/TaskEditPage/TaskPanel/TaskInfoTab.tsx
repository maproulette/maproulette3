import {
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  MapPin,
  Package,
  Trash2,
  ZoomIn,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import type { Task } from '@/types/Task'
import { useChallengeContext } from '../contexts/ChallengeContext'
import { useTaskMapContext } from '../contexts/TaskMapContext'

interface TaskTabProps {
  task: Task
  isPrimaryTask: boolean
  isInBundle?: boolean
  canAddToBundle?: boolean
  canRemoveFromBundle?: boolean
  onAddToBundle?: () => void
  onRemoveFromBundle?: () => void
  nonPrimaryBundleTaskIds?: number[]
  onOpenBundleTask?: (taskId: number) => void
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

export const parseTaskLocation = (task: Task): { lat: number; lng: number } | null => {
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

export const parseTaskProperties = (task: Task): Record<string, unknown> | null => {
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

export const TaskTab = ({
  task,
  isPrimaryTask,
  isInBundle,
  canAddToBundle,
  canRemoveFromBundle,
  onAddToBundle,
  onRemoveFromBundle,
  nonPrimaryBundleTaskIds,
  onOpenBundleTask,
}: TaskTabProps) => {
  const { challenge } = useChallengeContext()
  const { map, markersHidden, setMarkersHidden } = useTaskMapContext()

  const location = parseTaskLocation(task)

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
      {/* Bundle Task List (only for primary task) */}
      {isPrimaryTask && nonPrimaryBundleTaskIds && nonPrimaryBundleTaskIds.length > 0 && (
        <div>
          <div className="flex items-center gap-2 pb-2">
            <Package className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-medium text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
              Bundle Tasks ({nonPrimaryBundleTaskIds.length})
            </span>
          </div>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {nonPrimaryBundleTaskIds.map((taskId) => (
              <button
                key={taskId}
                type="button"
                onClick={() => onOpenBundleTask?.(taskId)}
                className="flex h-8 w-full items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-left text-sm transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
              >
                <span className="font-medium text-zinc-600 text-xs dark:text-zinc-300">
                  Task #{taskId}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {challenge?.instruction && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
          <h3 className="mb-2 font-semibold text-blue-600 text-xs uppercase tracking-wide dark:text-blue-400">
            Instructions
          </h3>
          <div className="prose-sm text-sm text-zinc-700 leading-relaxed dark:text-zinc-300 [&_a]:text-blue-600 [&_a]:hover:underline [&_a]:dark:text-blue-400 [&_blockquote]:my-2 [&_blockquote]:border-zinc-300 [&_blockquote]:border-l-2 [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:dark:border-zinc-600 [&_code]:rounded [&_code]:bg-zinc-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:dark:bg-zinc-800 [&_li]:my-0.5 [&_ol]:my-1 [&_ol]:ml-4 [&_ol]:list-decimal [&_p]:my-1 [&_p]:first:mt-0 [&_ul]:my-1 [&_ul]:ml-4 [&_ul]:list-disc">
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

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Bundle State Buttons/Indicators */}
        {canAddToBundle && onAddToBundle ? (
          <Button
            onClick={onAddToBundle}
            variant="outline"
            size="sm"
            className="w-full border-green-500/50 bg-green-50 text-green-700 shadow-sm transition-all hover:border-green-500 hover:bg-green-100 hover:shadow-md dark:border-green-600/50 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50"
          >
            <Package className="mr-2 h-3.5 w-3.5" />
            Add to Bundle
          </Button>
        ) : canRemoveFromBundle && onRemoveFromBundle ? (
          <Button
            onClick={onRemoveFromBundle}
            variant="outline"
            size="sm"
            className="w-full border-red-500/50 bg-red-50 text-red-700 shadow-sm transition-all hover:border-red-500 hover:bg-red-100 hover:shadow-md dark:border-red-600/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Remove from Bundle
          </Button>
        ) : isInBundle && isPrimaryTask ? (
          <div className="flex items-center justify-center gap-2 rounded-md bg-purple-50 px-3 py-2 font-medium text-purple-700 text-xs dark:bg-purple-900/30 dark:text-purple-400">
            <Package className="h-3.5 w-3.5" />
            Primary task in bundle
          </div>
        ) : isInBundle ? (
          <div className="flex items-center justify-center gap-2 rounded-md bg-zinc-100 px-3 py-2 font-medium text-xs text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400">
            <Package className="h-3.5 w-3.5" />
            In bundle
          </div>
        ) : null}

        <div className="flex gap-2">
          <Button
            onClick={() => setMarkersHidden(!markersHidden)}
            variant="outline"
            size="sm"
            className={`flex-1 shadow-sm transition-all hover:shadow-md ${
              markersHidden
                ? 'border-amber-500/50 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-100 dark:border-amber-600/50 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50'
                : 'border-zinc-300/50 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {markersHidden ? (
              <Eye className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <EyeOff className="mr-1.5 h-3.5 w-3.5" />
            )}
            {markersHidden ? 'Show' : 'Hide'}
          </Button>

          {(task.geometries || location) && (
            <Button
              onClick={handleZoomToTask}
              variant="outline"
              size="sm"
              className="flex-1 border-purple-500/50 bg-purple-50 text-purple-700 shadow-sm transition-all hover:border-purple-500 hover:bg-purple-100 hover:shadow-md dark:border-purple-600/50 dark:bg-purple-950/30 dark:text-purple-400 dark:hover:bg-purple-950/50"
            >
              <ZoomIn className="mr-1.5 h-3.5 w-3.5" />
              Zoom
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export const PropertiesTab = ({ task }: { task: Task }) => {
  const properties = parseTaskProperties(task)

  if (!properties || Object.keys(properties).length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No properties available for this task.
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {Object.entries(properties).map(([key, value]) => (
        <div
          key={key}
          className="flex items-start justify-between gap-2 rounded bg-zinc-100 px-2 py-1.5 text-xs dark:bg-zinc-800/50"
        >
          <span className="font-medium text-zinc-500 dark:text-zinc-400">{key}</span>
          <span className="text-right font-mono text-zinc-900 dark:text-zinc-100">
            {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
          </span>
        </div>
      ))}
    </div>
  )
}

export const LocationTab = ({ task }: { task: Task }) => {
  const location = parseTaskLocation(task)
  const hasValidChangeset = task.changesetId && task.changesetId > 0

  const handleCopyCoordinates = (lat: number, lng: number) => {
    const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    navigator.clipboard
      .writeText(coordString)
      .then(() => {
        toast.success('Coordinates copied to clipboard')
      })
      .catch(() => {
        toast.error('Failed to copy coordinates')
      })
  }

  return (
    <div className="space-y-3">
      {location && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopyCoordinates(location.lat, location.lng)}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Click to copy coordinates"
          >
            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-300">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </span>
            <Copy className="h-3 w-3 text-zinc-400" />
          </button>
        </div>
      )}
      {hasValidChangeset && (
        <a
          href={`https://www.openstreetmap.org/changeset/${task.changesetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Changeset #{task.changesetId}</span>
        </a>
      )}
      {!location && !hasValidChangeset && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No location data available for this task.
        </p>
      )}
    </div>
  )
}
