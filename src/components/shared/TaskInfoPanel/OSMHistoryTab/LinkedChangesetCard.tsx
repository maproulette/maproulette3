import { ExternalLink, GitCommit } from 'lucide-react'

interface LinkedChangesetCardProps {
  changesetId: number
  osmServer: string
}

export const LinkedChangesetCard = ({ changesetId, osmServer }: LinkedChangesetCardProps) => {
  return (
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
  )
}
