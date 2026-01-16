import { ChevronRight as ChevronRightIcon, MessageSquare } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/Table'
import { cn } from '@/lib/utils'
import type { Comment as TaskComment } from '@/types/Comment'
import type { Task } from '@/types/Task'
import { PRIORITY_LABELS, STATUS_COLORS, STATUS_LABELS } from './constants'
import { parseTaskLocation } from './utils'

interface TaskTableRowProps {
  task: Task
  isCurrentTask: boolean
  isSelected: boolean
  isExpanded: boolean
  comments?: TaskComment[]
  onSelectTask: (taskId: number) => void
  onToggleExpand: (taskId: number) => void
}

export const TaskTableRow = ({
  task,
  isCurrentTask,
  isSelected,
  isExpanded,
  comments,
  onSelectTask,
  onToggleExpand,
}: TaskTableRowProps) => {
  const { lat, lng } = parseTaskLocation(task)

  return (
    <TableRow
      className={cn(
        'transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800',
        isCurrentTask && 'bg-blue-50 dark:bg-blue-900/20',
        isSelected && 'bg-yellow-50 dark:bg-yellow-900/10'
      )}
    >
      <TableCell className="whitespace-nowrap px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation()
            onSelectTask(task.id)
          }}
          className="h-4 w-4 rounded border-zinc-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-700"
        />
      </TableCell>
      <TableCell className="whitespace-nowrap px-4 py-3">
        <button
          onClick={() => onToggleExpand(task.id)}
          className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          type="button"
        >
          <ChevronRightIcon
            className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
          />
        </button>
      </TableCell>
      <TableCell className="cursor-pointer whitespace-nowrap px-4 py-3 font-medium">
        {isCurrentTask && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500" />}
        {task.id}
      </TableCell>
      <TableCell className="cursor-pointer whitespace-nowrap px-4 py-3">
        <span
          className={cn(
            'rounded-full px-2 py-1 font-medium text-xs',
            STATUS_COLORS[task.status ?? 0] || STATUS_COLORS[0]
          )}
        >
          {STATUS_LABELS[task.status ?? 0] || 'Unknown'}
        </span>
      </TableCell>
      <TableCell className="cursor-pointer whitespace-nowrap px-4 py-3">
        <span className="text-zinc-600 dark:text-zinc-400">
          {PRIORITY_LABELS[task.priority ?? 0] || `Priority ${task.priority ?? 0}`}
        </span>
      </TableCell>
      <TableCell className="cursor-pointer whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
        {lat.toFixed(4)}, {lng.toFixed(4)}
      </TableCell>
      <TableCell className="whitespace-nowrap px-4 py-3">
        {comments && isExpanded && (
          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">{comments.length}</span>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
