import { Hash, ListTodo } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../../shared/EmptyState'
import { LoadingState } from '../../shared/LoadingState'
import { ResultCard } from '../../shared/ResultCard'
import { SectionDivider } from '../../shared/SectionDivider'
import { TextInputFilter } from '../../shared/TextInputFilter'

const FILLER_TASKS = [
  {
    id: 1001,
    name: 'Add missing stop signs in downtown',
    status: 'CREATED',
    priority: 'HIGH',
    parent: { id: 101, name: 'Missing Stop Signs Challenge' },
    created: '2024-10-15',
    modified: '2024-10-28',
  },
  {
    id: 1002,
    name: 'Fix incorrect street name - Main St',
    status: 'AVAILABLE',
    priority: 'MEDIUM',
    parent: { id: 102, name: 'Street Name Corrections' },
    created: '2024-10-20',
    modified: '2024-10-27',
  },
  {
    id: 1003,
    name: 'Verify building addresses on Elm Street',
    status: 'FIXED',
    priority: 'LOW',
    parent: { id: 103, name: 'Address Verification' },
    created: '2024-09-05',
    modified: '2024-10-25',
  },
  {
    id: 1004,
    name: 'Update park amenities and facilities',
    status: 'AVAILABLE',
    priority: 'MEDIUM',
    parent: { id: 104, name: 'Park Features Update' },
    created: '2024-10-18',
    modified: '2024-10-26',
  },
  {
    id: 1005,
    name: 'Correct highway exit numbers',
    status: 'CREATED',
    priority: 'HIGH',
    parent: { id: 105, name: 'Highway Maintenance' },
    created: '2024-10-22',
    modified: '2024-10-29',
  },
]

interface FindTaskProps {
  onResultSelect: () => void
}

export const FindTask = ({ onResultSelect }: FindTaskProps) => {
  const [taskId, setTaskId] = useState('')
  const [includeCompleted, _setIncludeCompleted] = useState(false)
  const [isLoading] = useState(false)

  // Filter tasks based on criteria
  const filteredTasks = FILLER_TASKS.filter((task) => {
    if (taskId && !task.id.toString().includes(taskId)) return false
    if (!includeCompleted && task.status === 'FIXED') return false
    return true
  })

  const getStatusBadge = (
    status: string
  ): { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string } => {
    switch (status) {
      case 'CREATED':
        return { variant: 'info', label: 'Created' }
      case 'AVAILABLE':
        return { variant: 'warning', label: 'Available' }
      case 'FIXED':
        return { variant: 'success', label: 'Fixed' }
      case 'FALSE_POSITIVE':
        return { variant: 'danger', label: 'False Positive' }
      case 'SKIPPED':
        return { variant: 'default', label: 'Skipped' }
      default:
        return { variant: 'default', label: status }
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 border-zinc-200 border-b pb-4 dark:border-zinc-800">
        <div className="space-y-3">
          <TextInputFilter
            label="Task ID"
            value={taskId}
            onChange={setTaskId}
            placeholder="Enter task ID..."
            icon={Hash}
            type="number"
          />
        </div>
      </div>

      <div>
        <SectionDivider label="Results" icon={ListTodo} />

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <LoadingState message="Loading tasks..." />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No tasks found"
              description="Try adjusting your filters to see more results"
            />
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                </span>
              </div>
              {filteredTasks.map((task) => (
                <ResultCard
                  key={task.id}
                  title={task.name}
                  description={`Challenge: ${task.parent.name}`}
                  href={`/challenge/${task.parent.id}/task/${task.id}`}
                  onClick={onResultSelect}
                  badge={getStatusBadge(task.status)}
                  metadata={[
                    { label: 'ID', value: task.id },
                    { label: 'Priority', value: task.priority },
                    { label: 'Modified', value: new Date(task.modified).toLocaleDateString() },
                  ]}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
