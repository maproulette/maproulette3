import { useTaskContext } from '@/components/TaskEditPage/TaskContext'
import { parseTaskProperties } from '../taskUtils'

export const PropertiesTab = () => {
  const { task } = useTaskContext()
  const properties = parseTaskProperties(task)

  if (!properties || Object.keys(properties).length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No properties available for this task.
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {Object.entries(properties).map(([key, value]) => (
        <div
          key={key}
          className="flex items-start justify-between gap-2 rounded bg-zinc-100 px-2 py-1.5 text-xs dark:bg-zinc-800/50"
        >
          <span className="font-medium text-zinc-500 dark:text-zinc-400">{key}</span>
          <span className="text-right font-mono text-zinc-900 dark:text-zinc-100">
            {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
          </span>
        </div>
      ))}
    </div>
  )
}
