import { Link } from '@tanstack/react-router'
import { Eye, EyeOff, Star, X, ZoomIn } from 'lucide-react'
import { api } from '@/api'
import { useChallengeContext } from '@/components/Pages/TaskEditPage/contexts/ChallengeContext'
import { EDITABLE_STATUSES } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import {
  calculateGeometryBounds,
  parseTaskLocation,
} from '@/components/TaskInfoPanel/taskUtils/geometryUtils'
import {
  getOsmServerUrl,
  parseOsmFeatureFromTask,
} from '@/components/TaskInfoPanel/taskUtils/osmUtils'
import { useAuthContext } from '@/contexts/AuthContext'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/taskConstants'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/Task'
import { EditorButton } from './TaskActions/EditorButton'
import { LockButton } from './TaskActions/LockButton'
import { SkipButton } from './TaskActions/SkipButton'

export type TaskRelation = 'primary' | 'bundle' | 'selection'

export const HEADER_GRADIENTS: Record<TaskRelation, string> = {
  primary:
    'bg-gradient-to-r from-amber-200 via-amber-100/50 to-white dark:from-amber-800/50 dark:via-amber-900/25 dark:to-slate-800',
  bundle:
    'bg-gradient-to-r from-green-200 via-green-100/50 to-white dark:from-green-800/50 dark:via-green-900/25 dark:to-slate-800',
  selection:
    'bg-gradient-to-r from-purple-200 via-purple-100/50 to-white dark:from-purple-800/50 dark:via-purple-900/25 dark:to-slate-800',
}

export const TaskInfoHeader = ({
  task,
  relation,
  showActions = true,
  isLocked = false,
  onClose,
}: {
  task: Task
  relation: TaskRelation
  showActions?: boolean
  isLocked?: boolean
  onClose?: () => void
}) => {
  const { challenge } = useChallengeContext()
  const { isAuthenticated } = useAuthContext()
  const { map, markersHidden, setMarkersHidden } = useTaskMapContext()
  const { data: project } = api.project.getProject(challenge?.parent)

  const status = task.status ?? 0
  const statusLabel = STATUS_LABELS[status] || 'Unknown'
  const statusColor = STATUS_COLORS[status] || 'bg-zinc-500'

  // Only show edit actions if user is authenticated, has locked the task, and status is editable
  const canEdit = isAuthenticated && isLocked && EDITABLE_STATUSES.includes(status)

  const location = parseTaskLocation(task)

  const osmFeature = parseOsmFeatureFromTask(task)
  const osmServer = getOsmServerUrl()
  const osmUrl =
    task.name && osmFeature
      ? `${osmServer}/${osmFeature.type}/${osmFeature.id}`
      : task.name && /^(node|way|relation)\/\d+$/.test(String(task.name))
        ? `${osmServer}/${task.name}`
        : task.name && /^\d+$/.test(String(task.name))
          ? `${osmServer}/way/${task.name}`
          : null

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
    <div
      className={cn(
        'shrink-0 space-y-2 rounded-t-xl border-slate-200 border-b bg-white px-4 pt-3 pb-3 dark:border-slate-700/50 dark:bg-slate-800',
        HEADER_GRADIENTS[relation]
      )}
    >
      {/* Task ID + Status + Primary badge + Map controls + Lock */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Task #{task.id}</span>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-white text-xs',
            statusColor
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
          {statusLabel}
        </div>
        {relation === 'primary' && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700 text-xs dark:bg-amber-900/30 dark:text-amber-400">
            <Star className="h-3 w-3 fill-current" />
            Primary
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {/* Hide/Show markers button */}
          <button
            type="button"
            onClick={() => setMarkersHidden(!markersHidden)}
            className={cn(
              'rounded-md p-1 transition-colors',
              markersHidden
                ? 'text-amber-600 hover:bg-amber-100/50 dark:text-amber-400 dark:hover:bg-amber-900/30'
                : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-slate-700 dark:hover:text-slate-300'
            )}
            title={markersHidden ? 'Show task geometry' : 'Hide task geometry'}
          >
            {markersHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          {/* Zoom to task button */}
          {(task.geometries || location) && (
            <button
              type="button"
              onClick={handleZoomToTask}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              title="Zoom to task"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          )}
          {EDITABLE_STATUSES.includes(status) && <LockButton />}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Task name */}
      {task.name && task.name !== String(task.id) && (
        <p className="break-all font-mono text-xs text-zinc-500 dark:text-zinc-400">{task.name}</p>
      )}

      {/* OSM ID (from task name which is often the OSM ID) */}
      {task.name && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">OSM ID: </span>
          {osmUrl ? (
            <a
              href={osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
            >
              {task.name}
            </a>
          ) : (
            task.name
          )}
        </div>
      )}

      {/* Challenge name */}
      {challenge && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">Challenge: </span>
          <Link
            to="/challenge/$challengeId"
            params={{ challengeId: String(challenge.id) }}
            className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
          >
            {challenge.name}
          </Link>
        </div>
      )}

      {/* Project name */}
      {project && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">Project: </span>
          <Link
            to="/project/$projectId"
            params={{ projectId: String(project.id) }}
            className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
          >
            {project.displayName ?? project.name}
          </Link>
        </div>
      )}

      {/* Skip + Editor buttons (only when user can edit) */}
      {showActions && canEdit && (
        <div className="flex items-center justify-end gap-2">
          <SkipButton task={task} />
          <EditorButton task={task} />
        </div>
      )}
    </div>
  )
}
