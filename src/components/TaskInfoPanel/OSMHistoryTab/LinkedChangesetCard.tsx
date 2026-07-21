import { ExternalLink, GitCommit } from 'lucide-react'
import { useIntl } from '@/i18n'

interface LinkedChangesetCardProps {
  changesetId: number
  osmServer: string
}

export const LinkedChangesetCard = ({ changesetId, osmServer }: LinkedChangesetCardProps) => {
  const { t } = useIntl()

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-white">
          <GitCommit className="h-4 w-4 text-green-600 dark:text-green-400" />
          {t('taskInfoPanel.osmHistory.linkedChangeset.title', undefined, 'Linked Changeset')}
        </div>
        <div className="mt-3 space-y-2">
          <a
            href={`${osmServer}/changeset/${changesetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-slate-800/50 dark:hover:bg-slate-800"
          >
            <div>
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {t(
                  'taskInfoPanel.osmHistory.linkedChangeset.changesetLabel',
                  { id: changesetId },
                  'Changeset #{id}'
                )}
              </div>
              <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                {t(
                  'taskInfoPanel.osmHistory.linkedChangeset.viewOnOsm',
                  undefined,
                  'View on OpenStreetMap'
                )}
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-zinc-400 dark:text-slate-500" />
          </a>

          <a
            href={`https://osmcha.org/changesets/${changesetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-slate-800/50 dark:hover:bg-slate-800"
          >
            <div>
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {t(
                  'taskInfoPanel.osmHistory.linkedChangeset.osmchaLink',
                  undefined,
                  'View in OSMCha'
                )}
              </div>
              <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                {t(
                  'taskInfoPanel.osmHistory.linkedChangeset.osmchaDescription',
                  undefined,
                  'Detailed changeset analysis'
                )}
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-zinc-400 dark:text-slate-500" />
          </a>

          <a
            href={`https://overpass-turbo.eu/?changeset=${changesetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-slate-800/50 dark:hover:bg-slate-800"
          >
            <div>
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {t(
                  'taskInfoPanel.osmHistory.linkedChangeset.overpassLink',
                  undefined,
                  'View in Overpass Turbo'
                )}
              </div>
              <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                {t(
                  'taskInfoPanel.osmHistory.linkedChangeset.overpassDescription',
                  undefined,
                  'Query changeset data'
                )}
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-zinc-400 dark:text-slate-500" />
          </a>
        </div>
      </div>
    </div>
  )
}
