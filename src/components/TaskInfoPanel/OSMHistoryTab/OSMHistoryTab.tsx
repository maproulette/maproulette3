import { Info } from 'lucide-react'
import { api } from '@/api'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useIntl } from '@/i18n'
import { parseOsmFeatureFromTask } from '../taskUtils/osmUtils'
import { AreaHistoryCard } from './AreaHistoryCard'
import { ElementHistoryCard } from './ElementHistoryCard'
import { LinkedChangesetCard } from './LinkedChangesetCard'
import { OSMFeatureCard } from './OSMFeatureCard'
import { TaskTimelineCard } from './TaskTimelineCard'

export const OSMHistoryTab = () => {
  const { t } = useIntl()
  const { task } = useTaskContext()
  const changesetId = task.changesetId
  const hasChangeset = changesetId && changesetId > 0
  const osmServer = api.osm.getOSMServerUrl()
  const osmFeature = parseOsmFeatureFromTask(task)
  const [lng, lat] = task.location.coordinates
  const coordinates = { lng, lat }

  return (
    <div className="space-y-4">
      {osmFeature ? (
        <>
          <OSMFeatureCard osmFeature={osmFeature} osmServer={osmServer} />
          <ElementHistoryCard osmFeature={osmFeature} osmServer={osmServer} />
        </>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-white">
            <Info className="h-4 w-4 text-zinc-500 dark:text-slate-500" />
            {t('taskInfoPanel.osmHistory.tab.noFeatureTitle', undefined, 'No OSM Feature Detected')}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-slate-400">
            {t(
              'taskInfoPanel.osmHistory.tab.noFeatureDescription',
              undefined,
              'This task\'s geometry does not contain OSM element identifiers (like @id: "way/12345"). OSM feature history is only available when tasks reference specific OpenStreetMap elements.'
            )}
          </p>
        </div>
      )}

      {hasChangeset ? (
        <LinkedChangesetCard changesetId={changesetId} osmServer={osmServer} />
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-white">
            <Info className="h-4 w-4 text-zinc-500 dark:text-slate-500" />
            {t('taskInfoPanel.osmHistory.tab.noChangesetTitle', undefined, 'No Changeset Linked')}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-slate-400">
            {t(
              'taskInfoPanel.osmHistory.tab.noChangesetDescription',
              undefined,
              'This task does not have an OSM changeset linked yet. A changeset will be automatically linked when the task is completed and the edits are saved to OpenStreetMap.'
            )}
          </p>
        </div>
      )}

      <AreaHistoryCard coordinates={coordinates} osmServer={osmServer} />

      <TaskTimelineCard task={task} />
    </div>
  )
}
