import { useEffect } from 'react'
import { api } from '@/api'
import { TaskMap } from '@/components/TaskEditPage/TaskMap'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import { useTaskBundleContext } from './contexts/TaskBundleContext'
import { useTaskContext } from './contexts/TaskContext'
import { TaskActions } from './TaskActions'
import { TaskPanel } from './TaskPanel'
import { TasksHeader } from './TasksHeader'

export const Task = () => {
  const { task } = useTaskContext()
  const { setActiveBundle } = useTaskBundleContext()

  // Fetch bundle if task belongs to one
  const { data: bundleData } = api.taskBundle.getTaskBundle(task.bundleId ?? 0)

  // Set active bundle when bundle data is loaded
  useEffect(() => {
    if (bundleData && task.bundleId) {
      setActiveBundle({
        bundleId: bundleData.bundleId,
        taskIds: bundleData.taskIds,
        name: `Bundle #${bundleData.bundleId}`,
      })
    }
  }, [bundleData, task.bundleId, setActiveBundle])

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-background shadow-xl dark:border-zinc-800">
      <div className="border-zinc-200 border-b bg-gradient-to-r from-zinc-50 to-white px-4 py-3.5 backdrop-blur-sm sm:px-6 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <TasksHeader />
          </div>
          <div className="flex-shrink-0">
            <TaskActions />
          </div>
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <TaskPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <TaskMap />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
