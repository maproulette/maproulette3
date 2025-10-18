import { TaskMap } from '@/components/TaskPage/TaskMap'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { TaskPanel } from './TaskPanel'
import { TaskActions } from './TaskActions'
import { TasksHeader } from './TasksHeader'

export const Task = () => {
  const { task } = useTaskContext()

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-zinc-950">
      <div className="bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <TaskActions />
          <TasksHeader />
        </div>
      </div>
      <div className="flex flex-1">
        <TaskPanel />
        <div className="flex-1 relative" style={{ height: 'calc(100vh - 10rem)' }}>
          <TaskMap task={task} className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}
