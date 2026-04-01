import { Info } from 'lucide-react'
import { api } from '@/api'
import { useTaskContext } from '@/components/TaskEditPage/TaskContext'
import { parseOsmFeatureFromTask, parseTaskLocation } from '../taskUtils'
import { AreaHistoryCard } from './AreaHistoryCard'
import { ElementHistoryCard } from './ElementHistoryCard'
import { LinkedChangesetCard } from './LinkedChangesetCard'
import { OSMFeatureCard } from './OSMFeatureCard'
import { TaskTimelineCard } from './TaskTimelineCard'

export const OSMHistoryTab = () => {
  const { task } = useTaskContext()
  const changesetId = task.changesetId
  const hasChangeset = changesetId && changesetId > 0
  const osmServer = api.osm.getOSMServerUrl()
  const osmFeature = parseOsmFeatureFromTask(task)
  const coordinates = parseTaskLocation(task)

  return (
    <div className="space-y-4">
      {osmFeature ? (
        <>
          <OSMFeatureCard osmFeature={osmFeature} osmServer={osmServer} />
          <ElementHistoryCard osmFeature={osmFeature} osmServer={osmServer} />
        </>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-zinc-100">
            <Info className="h-4 w-4 text-zinc-500" />
            No OSM Feature Detected
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            This task's geometry does not contain OSM element identifiers (like @id: "way/12345").
            OSM feature history is only available when tasks reference specific OpenStreetMap
            elements.
          </p>
        </div>
      )}

      {hasChangeset ? (
        <LinkedChangesetCard changesetId={changesetId} osmServer={osmServer} />
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

      {coordinates && <AreaHistoryCard coordinates={coordinates} osmServer={osmServer} />}

      <TaskTimelineCard task={task} />
    </div>
  )
}
