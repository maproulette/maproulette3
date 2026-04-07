import { GitCommit, History, Loader2, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/api'
import type { OSMHistoryElement } from '@/api/osm'
import { formatDate } from '@/lib/formatDate'
import type { OsmFeature } from '../taskUtils'

interface ElementHistoryCardProps {
  osmFeature: OsmFeature
  osmServer: string
}

export const ElementHistoryCard = ({ osmFeature, osmServer }: ElementHistoryCardProps) => {
  const [elementHistory, setElementHistory] = useState<OSMHistoryElement[] | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [osmFeature.type, osmFeature.id])

  return (
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
              const changesetData = typeof entry.changeset === 'object' ? entry.changeset : null
              const changesetIdValue =
                typeof entry.changeset === 'number' ? entry.changeset : changesetData?.id

              return (
                <div key={entry.version} className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800/50">
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
                      {formatDate(entry.timestamp)}
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
  )
}
