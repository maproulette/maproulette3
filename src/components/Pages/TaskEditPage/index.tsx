import { useLoaderData } from '@tanstack/react-router'
import { useEffect } from 'react'
import { api } from '@/api'
import { KeyboardShortcutsProvider } from '@/components/Pages/TaskEditPage/KeyboardShortcutsContext'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/TaskBundleContext'
import { useTaskContext } from '@/components/Pages/TaskEditPage/TaskContext'
import { TaskMap } from '@/components/Pages/TaskEditPage/TaskMap'
import { useSetPageTitle } from '@/components/PageTitleContext'
import {
  DrawerPortalProvider,
  DrawerPortalTarget,
} from '@/components/shared/TaskInfoPanel/DrawerPortalContext'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
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
    <DrawerPortalProvider>
      <div className="h-full px-4 md:overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <div className="relative h-full overflow-hidden">
              <TaskPanel />
              <DrawerPortalTarget />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className="ml-2" />
          <ResizablePanel defaultSize={70}>
            <div className="h-full overflow-hidden rounded-lg border border-slate-700/50">
              <TaskMap />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        <KeyboardShortcutsModal />
      </div>
    </DrawerPortalProvider>
  )
}

// Wrap TaskContent with the KeyboardShortcutsProvider
export const Task = () => {
  const { task } = useLoaderData({ from: '/_app/tasks/$taskId/' })
  useSetPageTitle(task.name)

  return (
    <KeyboardShortcutsProvider>
      <TaskContent />
    </KeyboardShortcutsProvider>
  )
}
