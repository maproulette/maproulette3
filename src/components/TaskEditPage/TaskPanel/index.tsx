import { FileText, GitCommit, MessageSquare, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/api'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import type { Task, TaskMarker } from '@/types/Task'
import { useTaskBundleContext } from '../contexts/TaskBundleContext'
import { useTaskContext } from '../contexts/TaskContext'
import { useTaskMapContext } from '../contexts/TaskMapContext'
import { CommentsHistoryTab } from './CommentsHistoryTab'
import { OSMHistoryTab } from './OSMHistoryTab'
import { TaskInfoTab } from './TaskInfoTab'

export const TaskPanel = () => {
  const { task: primaryTask } = useTaskContext()
  const { activeBundle, setActiveBundle, setInitialBundle, bundleEditsDisabled } =
    useTaskBundleContext()
  const { selectedMarker, setSelectedMarker, setActiveTaskId, emptyClickCount } =
    useTaskMapContext()
  const [activeTab, setActiveTab] = useState('info')
  const [selectedTaskId, setSelectedTaskId] = useState<number>(primaryTask.id)

  // Determine if selected marker is a non-bundle task
  const bundleTaskIds = activeBundle?.taskIds ?? [primaryTask.id]
  const isNonBundleSelection = selectedMarker && !bundleTaskIds.includes(selectedMarker.id)

  // The task ID we're actually viewing
  const viewedTaskId = isNonBundleSelection ? selectedMarker.id : selectedTaskId

  // Fetch the viewed task data (skip if it's the primary task since we already have it)
  const { data: fetchedTask } = api.task.getTask(viewedTaskId !== primaryTask.id ? viewedTaskId : 0)

  // The actual task object to display
  const viewedTask: Task =
    viewedTaskId === primaryTask.id ? primaryTask : (fetchedTask ?? primaryTask)

  // Fetch comments for the viewed task to show count in tab
  const commentsQueryResult = api.task.getTaskComments(viewedTask.id)
  const commentsCount = commentsQueryResult.data?.length ?? 0

  // Calculate OSM history count (1 if has changeset, 0 if not)
  const osmHistoryCount = viewedTask.changesetId && viewedTask.changesetId > 0 ? 1 : 0

  // When the bundle changes, reset to primary task if current selection is no longer in bundle
  useEffect(() => {
    if (!bundleTaskIds.includes(selectedTaskId)) {
      setSelectedTaskId(primaryTask.id)
    }
  }, [bundleTaskIds, selectedTaskId, primaryTask.id])

  // When a bundle task is clicked on the map, update the dropdown selection
  useEffect(() => {
    if (selectedMarker && bundleTaskIds.includes(selectedMarker.id)) {
      setSelectedTaskId(selectedMarker.id)
      setSelectedMarker(null)
    }
  }, [selectedMarker, bundleTaskIds, setSelectedMarker])

  // Keep the map's active task ID in sync with the panel's viewed task
  useEffect(() => {
    setActiveTaskId(viewedTaskId)
  }, [viewedTaskId, setActiveTaskId])

  // When empty space on map is clicked, reset to primary task
  useEffect(() => {
    if (emptyClickCount > 0) {
      setSelectedTaskId(primaryTask.id)
      setSelectedMarker(null)
    }
  }, [emptyClickCount, primaryTask.id, setSelectedMarker])

  const handleCloseNonBundleSelection = () => {
    setSelectedMarker(null)
    setSelectedTaskId(primaryTask.id)
  }

  const handleAddToBundle = () => {
    if (bundleEditsDisabled || !selectedMarker) return

    if (!activeBundle) {
      // Create new bundle with primary task and selected task
      const newBundle = {
        bundleId: 0,
        taskIds: [primaryTask.id, selectedMarker.id],
        tasks: [primaryTask],
        name: `Bundle (pending)`,
      }
      setActiveBundle(newBundle)
      setInitialBundle(null)
    } else {
      // Add to existing bundle
      if (activeBundle.taskIds.includes(selectedMarker.id)) {
        return // Already in bundle
      }
      const updatedTaskIds = [...activeBundle.taskIds, selectedMarker.id]
      setActiveBundle({
        ...activeBundle,
        taskIds: updatedTaskIds,
        tasks: activeBundle.tasks,
      })
    }

    // Clear the non-bundle selection and select the newly added task
    setSelectedMarker(null)
    setSelectedTaskId(selectedMarker.id)
  }

  const handleRemoveFromBundle = () => {
    if (bundleEditsDisabled || !activeBundle) return

    // Can't remove primary task
    if (viewedTaskId === primaryTask.id) return

    // Store the task we're removing to keep it selected
    const removedTaskId = viewedTaskId
    const removedTask = viewedTask

    const updatedTaskIds = activeBundle.taskIds.filter((id) => id !== removedTaskId)

    if (updatedTaskIds.length <= 1) {
      // Only primary task left, clear the bundle
      setActiveBundle(null)
      setInitialBundle(null)
    } else {
      setActiveBundle({
        ...activeBundle,
        taskIds: updatedTaskIds,
        tasks: activeBundle.tasks,
      })
    }

    // Keep the removed task selected in the purple non-bundle format
    // Create a marker-like object from the removed task
    const taskLocation =
      typeof removedTask.location === 'object' && removedTask.location
        ? removedTask.location
        : { lng: 0, lat: 0 }
    const removedTaskMarker: TaskMarker = {
      id: removedTaskId,
      location: taskLocation,
      status: removedTask.status ?? 0,
      priority: removedTask.priority ?? 0,
    }
    setSelectedMarker(removedTaskMarker)
    // Reset dropdown to primary task
    setSelectedTaskId(primaryTask.id)
  }

  // Determine bundle state for viewed task
  const isViewedTaskInBundle = activeBundle?.taskIds.includes(viewedTaskId) ?? false
  const isViewedTaskPrimary = viewedTaskId === primaryTask.id
  const canRemoveFromBundle =
    activeBundle && isViewedTaskInBundle && !isViewedTaskPrimary && !bundleEditsDisabled

  return (
    <div className="flex w-full flex-col overflow-hidden border border-zinc-200 bg-white md:h-[calc(100vh-11rem)] md:rounded-r-none dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header with Task Display */}
      <div className="shrink-0 border-zinc-200 border-b px-4 pt-4 pb-3 dark:border-zinc-800">
        {isViewedTaskPrimary ? (
          /* Primary Task Display */
          <div className="flex h-10 w-full items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 dark:border-zinc-700 dark:bg-zinc-900">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">
              Task #{viewedTaskId}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-[10px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              Primary
            </span>
          </div>
        ) : (
          /* Non-Primary Task Display - purple with X button */
          <div className="flex h-10 w-full items-center justify-between rounded-md border border-purple-300 bg-purple-50 px-3 dark:border-purple-700 dark:bg-purple-950/30">
            <span className="font-medium text-purple-700 dark:text-purple-300">
              Task #{viewedTaskId}
            </span>
            <button
              type="button"
              onClick={handleCloseNonBundleSelection}
              className="rounded-md p-1 text-purple-500 transition-colors hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/50 dark:hover:text-purple-300"
              aria-label="Close and return to primary task"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-zinc-200 border-b px-4 dark:border-zinc-800">
          <TabsList className="h-auto w-full justify-start gap-1 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="info"
              className="gap-1.5 rounded-none border-transparent border-b-2 bg-transparent px-3 py-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs">Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="gap-1.5 rounded-none border-transparent border-b-2 bg-transparent px-3 py-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-xs">Comments ({commentsCount})</span>
            </TabsTrigger>
            <TabsTrigger
              value="osm"
              className="gap-1.5 rounded-none border-transparent border-b-2 bg-transparent px-3 py-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400"
            >
              <GitCommit className="h-3.5 w-3.5" />
              <span className="text-xs">OSM Data ({osmHistoryCount})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-4">
            <TabsContent value="info" className="mt-0">
              <TaskInfoTab
                task={viewedTask}
                isPrimaryTask={isViewedTaskPrimary}
                isInBundle={isViewedTaskInBundle}
                canAddToBundle={!!isNonBundleSelection && !bundleEditsDisabled}
                canRemoveFromBundle={!!canRemoveFromBundle}
                onAddToBundle={handleAddToBundle}
                onRemoveFromBundle={handleRemoveFromBundle}
              />
            </TabsContent>
            <TabsContent value="comments" className="mt-0">
              <CommentsHistoryTab task={viewedTask} />
            </TabsContent>
            <TabsContent value="osm" className="mt-0">
              <OSMHistoryTab task={viewedTask} />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
