import { TaskMap } from '@/components/TaskPage/TaskMap'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { TaskActions } from './TaskActions'
import { TaskPanel } from './TaskPanel'
import { TasksHeader } from './TasksHeader'

export const Task = () => {
  const { task } = useTaskContext()

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-zinc-950">
      <div className="border-gray-200 border-b bg-gray-100 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <TaskActions />
          <TasksHeader />
        </div>
      </div>
      <div className="flex flex-1">
        <TaskPanel />
        <div className="relative flex-1" style={{ height: 'calc(100vh - 10rem)' }}>
          <TaskMap task={task} className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}
