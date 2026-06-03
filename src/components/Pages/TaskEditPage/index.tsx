import { useLoaderData } from '@tanstack/react-router'
import { useEffect } from 'react'
import { api } from '@/api'
import { KeyboardShortcutsProvider } from '@/components/Pages/TaskEditPage/contexts/KeyboardShortcutsContext'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { TaskMap } from '@/components/Pages/TaskEditPage/TaskMap'
import {
  DrawerPortalProvider,
  DrawerPortalTarget,
} from '@/components/TaskInfoPanel/DrawerPortalContext'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import { useSetPageTitleContext } from '@/contexts/PageTitleContext'
import { EditorProvider, useEditorContext } from './contexts/EditorContext'
import { IdEditorView } from './IdEditorView'
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'
import { TaskPanel } from './TaskPanel'

const viewPanelClass = (isActive: boolean) =>
  isActive ? 'absolute inset-0 z-[1]' : 'invisible absolute inset-0 z-0 pointer-events-none'

const TaskContent = () => {
  const { task } = useTaskContext()
  const { setActiveBundle, setInitialBundle } = useTaskBundleContext()
  const { activeView, idEditorMounted, showMap } = useEditorContext()

  // Fetch bundle if task belongs to one
  const { data: bundleData } = api.taskBundle.getTaskBundle(task.bundleId ?? 0)

  // Clear stale bundle immediately when navigating to a different task,
  // before the new bundle data has loaded
  useEffect(() => {
    setActiveBundle(null)
    setInitialBundle(null)
  }, [task.id, setActiveBundle, setInitialBundle])

  // Set active bundle and initial bundle when bundle data is loaded,
  // or clear when navigating to a task without a bundle
  useEffect(() => {
    if (bundleData && task.bundleId) {
      const bundle = {
        bundleId: bundleData.bundleId,
        taskIds: bundleData.taskIds,
        name: `Bundle #${bundleData.bundleId}`,
      }
      setActiveBundle(bundle)
      setInitialBundle(bundle)
    } else if (!task.bundleId) {
      setActiveBundle(null)
      setInitialBundle(null)
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
            <div className="relative h-full overflow-hidden rounded-lg border border-slate-700/50">
              <div className={viewPanelClass(activeView === 'map')}>
                <TaskMap />
              </div>
              {idEditorMounted && (
                <div className={viewPanelClass(activeView === 'id')}>
                  <IdEditorView onClose={showMap} />
                </div>
              )}
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
  useSetPageTitleContext(task.name)

  return (
    <KeyboardShortcutsProvider>
      <EditorProvider>
        <TaskContent />
      </EditorProvider>
    </KeyboardShortcutsProvider>
  )
}
