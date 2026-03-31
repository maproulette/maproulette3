import { CheckCircle2, ChevronDown, FolderOpen, Hash, LayoutGrid, ListTodo } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '@/api'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { cn } from '@/utils/utils'
import { useProjectContext } from '@/components/TaskEditPage/contexts/ProjectContext'

export const ProjectInfoPanel = () => {
  const [isOpen, setIsOpen] = useState(true)
  const { project } = useProjectContext()

  const { data: projectStats } = api.project.getProjectStats(project?.id)

  const { data: projectChallenges } = api.project.getProjectChallenges(project?.id, 100, 0)

  if (!project) return null

  const challengesCount = projectChallenges?.length || 0
  const totalTasks = projectStats?.actions?.total || 0
  const availableTasks = projectStats?.actions?.available || 0
  const completedTasks = totalTasks - availableTasks
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const incompleteChallenges =
    projectChallenges?.filter(
      (challenge) =>
        (challenge.tasksRemaining && challenge.tasksRemaining > 0) ||
        (challenge.completionPercentage !== undefined &&
          challenge.completionPercentage !== null &&
          challenge.completionPercentage < 100)
    ).length || 0

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600">
                <FolderOpen className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Project Information
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
            {/* Project name and ID */}
            <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800/50">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{project.name}</h4>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Hash className="h-3 w-3" />
                <span>ID: {project.id}</span>
              </div>
            </div>

            {/* Description with markdown support */}
            {project.description && (
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
                  {project.description}
                </ReactMarkdown>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-zinc-100 p-3 text-center dark:bg-zinc-800/50">
                <div className="mb-1 flex justify-center">
                  <LayoutGrid className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {challengesCount}
                </div>
                <div className="font-medium text-[10px] text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Challenges
                </div>
              </div>
              <div className="rounded-lg bg-zinc-100 p-3 text-center dark:bg-zinc-800/50">
                <div className="mb-1 flex justify-center">
                  <ListTodo className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {incompleteChallenges}
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
