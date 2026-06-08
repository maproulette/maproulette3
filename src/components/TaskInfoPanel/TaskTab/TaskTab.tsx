import { useChallengeContext } from '@/components/Pages/TaskEditPage/contexts/ChallengeContext'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { substituteTaskProperties } from '@/components/TaskInfoPanel/taskUtils/propertyUtils'
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
  activeDrawerTaskId?: number | null
}

export const TaskTab = ({
  task,
  canAddToBundle,
  onAddToBundle,
  onRemoveFromBundle,
  nonPrimaryBundleTaskIds: nonPrimaryBundleTaskIdsProp,
  onOpenBundleTask,
  activeDrawerTaskId,
}: TaskTabProps) => {
  const { challenge } = useChallengeContext()
  const { task: primaryTask } = useTaskContext()
  const { activeBundle, bundleEditsDisabled } = useTaskBundleContext()

  const isPrimaryTask = task.id === primaryTask.id
  const isInBundle = activeBundle?.taskIds.includes(task.id) ?? false
  const canRemoveFromBundle = isInBundle && !isPrimaryTask && !bundleEditsDisabled
  const nonPrimaryBundleTaskIds =
    nonPrimaryBundleTaskIdsProp ?? activeBundle?.taskIds.filter((id) => id !== primaryTask.id) ?? []
  const allBundleTaskIds =
    nonPrimaryBundleTaskIds.length > 0 ? [primaryTask.id, ...nonPrimaryBundleTaskIds] : []

  return (
    <div className="space-y-4">
      <BundleTaskList
        taskIds={allBundleTaskIds}
        primaryTaskId={primaryTask.id}
        onOpenBundleTask={onOpenBundleTask}
        activeDrawerTaskId={activeDrawerTaskId}
      />

      <BundleStateIndicator
        canAddToBundle={!!canAddToBundle}
        canRemoveFromBundle={canRemoveFromBundle}
        isInBundle={isInBundle}
        isPrimaryTask={isPrimaryTask}
        onAddToBundle={onAddToBundle}
        onRemoveFromBundle={onRemoveFromBundle}
      />

      <InstructionPanel
        taskInstruction={
          challenge?.instruction
            ? substituteTaskProperties(challenge.instruction, task)
            : undefined
        }
        challengeDescription={challenge?.description ?? undefined}
      />
    </div>
  )
}
