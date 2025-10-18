import { useChallengeContext } from '@/contexts/tasks/ChallengeContext'
import { useProjectContext } from '@/contexts/tasks/ProjectContext'
import { ChallengeInfoPanel } from './ChallengeInfoPanel'
import { ProjectInfoPanel } from './ProjectInfoPanel'
import { TaskInstructionsPanel } from './TaskInstructionsPanel'
export const TaskPanel = () => {
  const { challenge } = useChallengeContext()
  const { project } = useProjectContext()

  return (
    <div
      className="w-96 border-gray-200 border-r bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900"
      style={{ height: 'calc(100vh - 10rem)' }}
    >
      <div className="h-full space-y-4 overflow-y-auto p-4">
        {/* Challenge Title */}
        <div className="px-2">
          <h1 className="mb-1 font-bold text-gray-900 text-xl dark:text-gray-100">
            {challenge?.name}
          </h1>
          <p className="text-gray-600 text-sm dark:text-gray-400">{project?.name || ''}</p>
        </div>
        {/* Instructions Panel */}
        <TaskInstructionsPanel />
        <ChallengeInfoPanel />
        <ProjectInfoPanel />

        {/* Metrics Panel */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <div className="border-gray-200 border-b px-4 py-3 dark:border-zinc-700">
            <h3 className="flex items-center justify-between font-semibold text-gray-900 text-sm dark:text-gray-100">
              Metrics
              <svg
                className="h-4 w-4 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}
