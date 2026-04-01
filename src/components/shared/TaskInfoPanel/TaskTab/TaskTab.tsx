import { useChallengeContext } from '@/components/TaskEditPage/ChallengeContext'
import { useTaskBundleContext } from '@/components/TaskEditPage/TaskBundleContext'
import { useTaskContext } from '@/components/TaskEditPage/TaskContext'
import type { Task } from '@/types/Task'
import { BundleStateIndicator } from './BundleStateIndicator'
import { BundleTaskList } from './BundleTaskList'
import { InstructionPanel } from './InstructionPanel'

interface TaskTabProps {
  task: Task
  /** Whether this task can be added to the active bundle */
  canAddToBundle?: boolean
  onAddToBundle?: () => void
  onRemoveFromBundle?: () => void
  /** Override for bundle task IDs to display (e.g. from a fetched bundle). Falls back to active bundle context. */
  nonPrimaryBundleTaskIds?: number[]
  onOpenBundleTask?: (taskId: number) => void
}

export const TaskTab = ({
  task,
  canAddToBundle,
  onAddToBundle,
  onRemoveFromBundle,
  nonPrimaryBundleTaskIds: nonPrimaryBundleTaskIdsProp,
  onOpenBundleTask,
}: TaskTabProps) => {
  const { challenge } = useChallengeContext()
  const { task: primaryTask } = useTaskContext()
  const { activeBundle, bundleEditsDisabled } = useTaskBundleContext()

  const isPrimaryTask = task.id === primaryTask.id
  const isInBundle = activeBundle?.taskIds.includes(task.id) ?? false
  const canRemoveFromBundle = isInBundle && !isPrimaryTask && !bundleEditsDisabled
  const nonPrimaryBundleTaskIds =
    nonPrimaryBundleTaskIdsProp ?? activeBundle?.taskIds.filter((id) => id !== primaryTask.id) ?? []

  return (
    <div className="space-y-4">
      <BundleTaskList taskIds={nonPrimaryBundleTaskIds} onOpenBundleTask={onOpenBundleTask} />

      <BundleStateIndicator
        canAddToBundle={!!canAddToBundle}
        canRemoveFromBundle={canRemoveFromBundle}
        isInBundle={isInBundle}
        isPrimaryTask={isPrimaryTask}
        onAddToBundle={onAddToBundle}
        onRemoveFromBundle={onRemoveFromBundle}
      />

      <InstructionPanel
        taskInstruction={challenge?.instruction}
        challengeDescription={challenge?.description ?? undefined}
      />
    </div>
  )
}
