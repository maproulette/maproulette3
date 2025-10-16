import { useTaskContext } from '@/contexts/tasks/contexts/TaskContext'

export const Task = () => {
  const { task } = useTaskContext()

  return (
    <>
      <title>{task?.name ? `Task: ${task.name}` : 'Loading task...'}</title>
      <div className="h-screen">
        {/* Main Content */}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Left Sidebar */}
          <div className="w-80 overflow-y-auto">
            <div className="p-4 space-y-4">task {task.id}</div>
          </div>
        </div>
      </div>
    </>
  )
}
