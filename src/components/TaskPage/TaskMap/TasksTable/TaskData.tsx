interface TaskDataProps {
  taskData: unknown
  isLoading: boolean
}

export const TaskData = ({ taskData, isLoading }: TaskDataProps) => {
  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
        Task Data
      </h4>
      {isLoading ? (
        <div className="text-sm text-zinc-500">Loading task data...</div>
      ) : taskData ? (
        <pre className="max-h-96 overflow-auto rounded border border-zinc-300 bg-white p-3 font-mono text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {JSON.stringify(taskData, null, 2)}
        </pre>
      ) : (
        <div className="text-sm text-zinc-500">No task data available</div>
      )}
    </div>
  )
}

