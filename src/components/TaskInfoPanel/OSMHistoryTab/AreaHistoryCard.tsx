import { ExternalLink, MapPin } from 'lucide-react'

interface AreaHistoryCardProps {
  coordinates: { lat: number; lng: number }
  osmServer: string
}

export const AreaHistoryCard = ({ coordinates, osmServer }: AreaHistoryCardProps) => {
  return (
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
            <div className="font-medium text-blue-600 dark:text-blue-400">OSMCha Area Filter</div>
            <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              All changesets in this area
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-zinc-400" />
        </a>
      </div>
    </div>
  )
}
