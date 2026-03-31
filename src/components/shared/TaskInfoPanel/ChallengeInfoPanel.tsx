import { CheckCircle2, ChevronDown, Flag, Gauge, Hash, ListTodo } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '@/api'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { cn } from '@/utils/utils'
import { getDifficultyLabel } from '@/utils/difficultyLevelData'
import { useChallengeContext } from '@/components/TaskEditPage/contexts/ChallengeContext'

export const ChallengeInfoPanel = () => {
  const [isOpen, setIsOpen] = useState(true)
  const { challenge } = useChallengeContext()

  const { data: challengeStats } = api.challenge.getChallengeStats(challenge?.id ?? 0)

  if (!challenge) return null

  const stats = challengeStats?.[0]?.actions
  const tasksRemaining = stats?.available ?? challenge.tasksRemaining ?? 0
  const totalTasks = stats?.total ?? 0
  const completedTasks = totalTasks > 0 ? totalTasks - tasksRemaining : 0
  const completionPercentage =
    challenge.completionPercentage ??
    (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-amber-600">
                <Flag className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Challenge Information
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-zinc-500 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-4 px-4 pt-0 pb-4">
            {/* Challenge name and ID */}
            <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800/50">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{challenge.name}</h4>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Hash className="h-3 w-3" />
                <span>ID: {challenge.id}</span>
              </div>
            </div>

            {/* Description with markdown support */}
            {challenge.description && (
              <div className="markdown-content text-sm text-zinc-700 leading-relaxed dark:text-zinc-300 [&_a]:text-blue-600 [&_a]:hover:underline [&_a]:dark:text-blue-400 [&_blockquote]:my-2 [&_blockquote]:border-zinc-300 [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:dark:border-zinc-600 [&_code]:rounded [&_code]:bg-zinc-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:dark:bg-zinc-800 [&_li]:my-1 [&_ol]:my-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_p]:my-2 [&_p]:first:mt-0 [&_ul]:my-2 [&_ul]:ml-4 [&_ul]:list-disc">
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
                  {challenge.description}
                </ReactMarkdown>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-zinc-100 p-3 text-center dark:bg-zinc-800/50">
                <div className="mb-1 flex justify-center">
                  <Gauge className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {getDifficultyLabel(challenge.difficulty)}
                </div>
                <div className="font-medium text-[10px] text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Difficulty
                </div>
              </div>
              <div className="rounded-lg bg-zinc-100 p-3 text-center dark:bg-zinc-800/50">
                <div className="mb-1 flex justify-center">
                  <ListTodo className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {tasksRemaining.toLocaleString()}
                </div>
                <div className="font-medium text-[10px] text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Remaining
                </div>
              </div>
              <div className="rounded-lg bg-zinc-100 p-3 text-center dark:bg-zinc-800/50">
                <div className="mb-1 flex justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {completionPercentage}%
                </div>
                <div className="font-medium text-[10px] text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Complete
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
