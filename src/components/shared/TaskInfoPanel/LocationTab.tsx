import { Copy, ExternalLink, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import type { Task } from '@/types/Task'
import { parseTaskLocation } from './taskUtils'

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
          className="flex items-center gap-1.5 text-blue-600 text-sm hover:underline dark:text-blue-400"
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
