import { useEffect } from 'react'
import { api } from '@/api'
import { TaskMap } from '@/components/TaskEditPage/TaskMap'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext'
import { useTaskBundleContext } from './contexts/TaskBundleContext'
import { useTaskContext } from './contexts/TaskContext'
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'
import { TaskPanel } from './TaskPanel'

const TaskContent = () => {
  const { task } = useTaskContext()
  const { setActiveBundle, setInitialBundle } = useTaskBundleContext()

  // Fetch bundle if task belongs to one
  const { data: bundleData } = api.taskBundle.getTaskBundle(task.bundleId ?? 0)

  // Set active bundle and initial bundle when bundle data is loaded
  useEffect(() => {
    if (bundleData && task.bundleId) {
      const bundle = {
        bundleId: bundleData.bundleId,
        taskIds: bundleData.taskIds,
        name: `Bundle #${bundleData.bundleId}`,
      }
      setActiveBundle(bundle)
      setInitialBundle(bundle)
    }
  }, [bundleData, task.bundleId, setActiveBundle, setInitialBundle])

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-background shadow-xl dark:border-zinc-800">
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <TaskPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <TaskMap />
        </ResizablePanel>
      </ResizablePanelGroup>

      <KeyboardShortcutsModal />
    </div>
  )
}

// Wrap TaskContent with the KeyboardShortcutsProvider
export const Task = () => (
  <KeyboardShortcutsProvider>
    <TaskContent />
  </KeyboardShortcutsProvider>
)
