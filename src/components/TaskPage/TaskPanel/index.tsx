import { useChallengeContext } from '@/contexts/tasks/ChallengeContext'
import { useProjectContext } from '@/contexts/tasks/ProjectContext'
import { ChallengeInfoPanel } from './ChallengeInfoPanel'
import { ProjectInfoPanel } from './ProjectInfoPanel'
import { TaskInstructionsPanel } from './TaskInstructionsPanel'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'

export const TaskPanel = () => {
  const { challenge } = useChallengeContext()
  const { project } = useProjectContext()

  return (
    <div
      className="w-96 border-gray-200 border-r bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 md:h-[calc(100vh-11.4rem)]"
    >
      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          {/* Challenge Title */}
          <div className="px-2">
            <h1 className="mb-1 font-bold text-gray-900 text-xl dark:text-gray-100">
              {challenge?.name}
            </h1>
            <p className="text-gray-600 text-sm dark:text-gray-400">{project?.name || ''}</p>
          </div>

          <Separator />

          {/* Instructions Panel */}
          <TaskInstructionsPanel />
          <ChallengeInfoPanel />
          <ProjectInfoPanel />

        {/* Metrics Panel - Placeholder for future implementation */}
        </div>
      </ScrollArea>
    </div>
  )
}
