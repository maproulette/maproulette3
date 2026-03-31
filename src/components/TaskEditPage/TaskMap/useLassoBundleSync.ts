import { useEffect } from 'react'
import type { TaskBundle } from '@/components/TaskEditPage/TaskBundleContext'
import { MAX_SELECTED_TASKS } from '@/components/TaskEditPage/TaskMapContext'
import type { Task } from '@/types/Task'

export const useLassoBundleSync = (
  selectedTaskIds: Set<number>,
  activeBundle: TaskBundle | null,
  setActiveBundle: (bundle: TaskBundle | null) => void,
  clearSelection: () => void,
  primaryTaskId: number,
  primaryTaskData: Task | undefined
) => {
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
