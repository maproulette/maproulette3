import { useEffect } from 'react'
import { api } from '@/api'
import type { TaskBundle } from '@/components/Pages/TaskEditPage/TaskBundleContext'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/TaskBundleContext'
import { useTaskContext } from '@/components/Pages/TaskEditPage/TaskContext'
import {
  MAX_SELECTED_TASKS,
  useTaskMapContext,
} from '@/components/Pages/TaskEditPage/TaskMapContext'

export const useLassoBundleSync = () => {
  const { selectedTaskIds, clearSelection } = useTaskMapContext()
  const { activeBundle, setActiveBundle } = useTaskBundleContext()
  const { task } = useTaskContext()
  const primaryTaskId = task.id
  const { data: primaryTaskData } = api.task.getTask(primaryTaskId)

  useEffect(() => {
    if (selectedTaskIds.size === 0) return

    const selectedArray = Array.from(selectedTaskIds)

    if (!activeBundle) {
      // Create new bundle with primary task and selected tasks
      const newTaskIds = [primaryTaskId, ...selectedArray].slice(0, MAX_SELECTED_TASKS)
      const newBundle: TaskBundle = {
        bundleId: 0,
        taskIds: newTaskIds,
        tasks: primaryTaskData ? [primaryTaskData] : [],
        name: 'Bundle (pending)',
      }
      setActiveBundle(newBundle)
    } else {
      // Add to existing bundle
      const newTaskIds = selectedArray.filter((id) => !activeBundle.taskIds.includes(id))

      if (newTaskIds.length > 0) {
        const updatedTaskIds = [...activeBundle.taskIds, ...newTaskIds].slice(0, MAX_SELECTED_TASKS)
        setActiveBundle({
          ...activeBundle,
          taskIds: updatedTaskIds,
          tasks: activeBundle.tasks,
        })
      }
    }

    // Clear selection after adding to bundle
    clearSelection()
  }, [
    selectedTaskIds,
    activeBundle,
    setActiveBundle,
    clearSelection,
    primaryTaskId,
    primaryTaskData,
  ])
}
