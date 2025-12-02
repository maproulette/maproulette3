import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '@/api'
import { TaskMap } from '@/components/TaskPage/TaskMap'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import { useTaskBundleContext } from '@/contexts/tasks/TaskBundleContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { TaskActions } from './TaskActions'
import { TaskPanel } from './TaskPanel'
import { TasksHeader } from './TasksHeader'

export const Task = () => {
  const { task } = useTaskContext()
  const { setActiveBundle } = useTaskBundleContext()

  // Fetch bundle if task belongs to one
  const { data: bundleData } = useQuery({
    ...api.taskBundle.getTaskBundle(task.bundleId ?? 0),
    enabled: !!task.bundleId,
  })

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
    <div className="flex flex-col overflow-hidden rounded-lg bg-gray-50 shadow-lg dark:bg-zinc-950">
      <div className="border-gray-200 border-b bg-gray-100 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <TasksHeader />
          <TaskActions />
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <ResizablePanel defaultSize={25} minSize={15} maxSize={50}>
          <TaskPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <TaskMap />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
