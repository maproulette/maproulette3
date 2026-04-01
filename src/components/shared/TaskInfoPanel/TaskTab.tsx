import { Package, Trash2 } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useChallengeContext } from '@/components/TaskEditPage/ChallengeContext'
import { useTaskBundleContext } from '@/components/TaskEditPage/TaskBundleContext'
import { useTaskContext } from '@/components/TaskEditPage/TaskContext'
import { Button } from '@/components/ui/Button'
import type { Task } from '@/types/Task'
import { cn } from '@/utils/utils'

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

const markdownClasses =
  'text-sm text-zinc-700 leading-relaxed dark:text-zinc-300 [&_a]:text-blue-600 [&_a]:hover:underline [&_a]:dark:text-blue-400 [&_blockquote]:my-2 [&_blockquote]:border-zinc-300 [&_blockquote]:border-l-2 [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:dark:border-zinc-600 [&_code]:rounded [&_code]:bg-zinc-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:dark:bg-zinc-800 [&_li]:my-0.5 [&_ol]:my-1 [&_ol]:ml-4 [&_ol]:list-decimal [&_p]:my-1 [&_p]:first:mt-0 [&_ul]:my-1 [&_ul]:ml-4 [&_ul]:list-disc'

type InstructionView = 'task' | 'challenge'

/** Convert bare URLs in text to markdown links so ReactMarkdown renders them */
const autoLinkUrls = (text: string): string =>
  text.replace(/(?<!\]\()(?<!\()(https?:\/\/[^\s)<>]+)/g, (url) => `[${url}](${url})`)

const InstructionContent = ({ content }: { content: string }) => (
  <div className={markdownClasses}>
    <ReactMarkdown
      components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          />
        ),
      }}
    >
      {autoLinkUrls(content)}
    </ReactMarkdown>
  </div>
)

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
  const hasTaskInstruction = !!challenge?.instruction
  const hasChallengeInstruction = !!challenge?.description
  const [instructionView, setInstructionView] = useState<InstructionView>('task')

  return (
    <div className="space-y-4">
      {/* Bundle Task List */}
      {nonPrimaryBundleTaskIds && nonPrimaryBundleTaskIds.length > 0 && (
        <div>
          <div className="flex items-center gap-2 pb-2">
            <Package className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-medium text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
              Bundled Tasks ({nonPrimaryBundleTaskIds.length})
            </span>
          </div>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {nonPrimaryBundleTaskIds.map((taskId) => (
              <button
                key={taskId}
                type="button"
                onClick={() => onOpenBundleTask?.(taskId)}
                className="flex h-8 w-full items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-left text-sm transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
              >
                <span className="font-medium text-xs text-zinc-600 dark:text-zinc-300">
                  Task #{taskId}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bundle State Buttons/Indicators */}
      {canAddToBundle && onAddToBundle ? (
        <Button
          onClick={onAddToBundle}
          variant="outline"
          size="sm"
          className="w-full border-green-500/50 bg-green-50 text-green-700 shadow-sm transition-all hover:border-green-500 hover:bg-green-100 hover:shadow-md dark:border-green-600/50 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50"
        >
          <Package className="mr-2 h-3.5 w-3.5" />
          Add to Bundle
        </Button>
      ) : canRemoveFromBundle && onRemoveFromBundle ? (
        <Button
          onClick={onRemoveFromBundle}
          variant="outline"
          size="sm"
          className="w-full border-red-500/50 bg-red-50 text-red-700 shadow-sm transition-all hover:border-red-500 hover:bg-red-100 hover:shadow-md dark:border-red-600/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Remove from Bundle
        </Button>
      ) : isInBundle && isPrimaryTask ? (
        <div className="flex items-center justify-center gap-2 rounded-md bg-purple-50 px-3 py-2 font-medium text-purple-700 text-xs dark:bg-purple-900/30 dark:text-purple-400">
          <Package className="h-3.5 w-3.5" />
          Primary task in bundle
        </div>
      ) : isInBundle ? (
        <div className="flex items-center justify-center gap-2 rounded-md bg-zinc-100 px-3 py-2 font-medium text-xs text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400">
          <Package className="h-3.5 w-3.5" />
          In bundle
        </div>
      ) : null}

      {/* Instructions with toggle */}
      {(hasTaskInstruction || hasChallengeInstruction) && (
        <div>
          {/* Toggle between task and challenge instructions */}
          <div className="mb-3 flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setInstructionView('task')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 font-medium text-xs transition-colors',
                instructionView === 'task'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
              )}
            >
              Task
            </button>
            <button
              type="button"
              onClick={() => setInstructionView('challenge')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 font-medium text-xs transition-colors',
                instructionView === 'challenge'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
              )}
            >
              Challenge
            </button>
          </div>

          {/* Instruction content */}
          {instructionView === 'task' ? (
            hasTaskInstruction ? (
              <InstructionContent content={challenge?.instruction} />
            ) : (
              <p className="text-sm text-zinc-500 italic dark:text-zinc-400">
                No task instructions available.
              </p>
            )
          ) : hasChallengeInstruction ? (
            <InstructionContent content={challenge?.description ?? ''} />
          ) : (
            <p className="text-sm text-zinc-500 italic dark:text-zinc-400">
              No challenge description available.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
