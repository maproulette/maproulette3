import type { TaskMarker } from '@/types/Task'

interface OverlapPopupProps {
  tasks: TaskMarker[]
}

export const OverlapPopup = ({ tasks }: OverlapPopupProps) => {
  return (
    <div className="max-w-xs p-2">
      <h3 className="mb-2 font-semibold text-sm">Overlapping Tasks ({tasks.length})</h3>
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.id} className="rounded bg-zinc-100 p-2 text-xs dark:bg-zinc-800">
            <div className="font-medium">Task #{task.id}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface SingleTaskPopupProps {
  task: TaskMarker
}

export const SingleTaskPopup = ({ task }: SingleTaskPopupProps) => {
  return (
    <div className="max-w-xs p-2">
      <div className="font-semibold text-sm">Task #{task.id}</div>
    </div>
  )
}
