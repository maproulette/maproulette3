import { useEditorContext } from '@/components/Pages/TaskEditPage/contexts/EditorContext'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import { TaskTab } from '@/components/TaskInfoPanel/TaskTab/TaskTab'
import { TaskTabs } from '@/components/TaskInfoPanel/TaskTabs'
import { Drawer } from '@/components/ui/Drawer'
import { TaskActions } from './TaskActions/TaskActions'
import { TaskInfoHeader } from './TaskInfoHeader'

export const TaskPanel = () => {
  const { task, isLocked } = useTaskContext()
  const { setSelectedMarker } = useTaskMapContext()
  const { highlightIdEntityRef, activeView } = useEditorContext()
  const { setDrawerTaskId, drawerOpen, viewedTask, isViewedTaskInBundle } = useTaskBundleContext()

  const handleCloseDrawer = () => {
    setDrawerTaskId(null)
    setSelectedMarker(null)
    if (activeView === 'id') highlightIdEntityRef.current?.(null)
  }

  return (
    <div className="relative flex w-full flex-col overflow-hidden md:h-full">
      {/* Primary Task Info Header */}
      <TaskInfoHeader task={task} relation="primary" isLocked={isLocked} />

      {/* Primary Task Tabs */}
      <TaskTabs task={task} contentClassName="p-4 pb-44" taskTabContent={<TaskTab task={task} />} />

      {/* Task Actions Footer - floats over content, under drawer */}
      <div className="absolute right-0 bottom-0 left-0 z-10 rounded-b-2xl border-slate-200/80 border-t bg-white px-3 pt-3 pb-3 dark:border-slate-700/50 dark:bg-slate-800">
        <TaskActions />
      </div>

      {/* Drawer overlay for non-primary tasks */}
      <Drawer open={drawerOpen} onClose={handleCloseDrawer}>
        {/* Drawer Task Info Header */}
        <TaskInfoHeader
          task={viewedTask}
          relation={isViewedTaskInBundle ? 'bundle' : 'selection'}
          showActions={false}
          onClose={handleCloseDrawer}
        />

        {/* Drawer Task Tabs */}
        {drawerOpen && (
          <TaskTabs
            task={viewedTask}
            contentClassName="p-4 pb-44"
            taskTabContent={<TaskTab task={viewedTask} />}
          />
        )}
      </Drawer>
    </div>
  )
}
