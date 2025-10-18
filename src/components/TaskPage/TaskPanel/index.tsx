import { useChallengeContext } from '@/contexts/tasks/ChallengeContext'
import { useProjectContext } from '@/contexts/tasks/ProjectContext'
import { TaskInstructionsPanel } from './TaskInstructionsPanel'
import { ChallengeInfoPanel } from './ChallengeInfoPanel'
import { ProjectInfoPanel } from './ProjectInfoPanel'
export const TaskPanel = () => {
  const { challenge } = useChallengeContext()
  const { project } = useProjectContext()

  return (
    <div
      className="w-96 bg-gray-50 dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800"
      style={{ height: 'calc(100vh - 10rem)' }}
    >
      <div className="p-4 space-y-4 overflow-y-auto h-full">
        {/* Challenge Title */}
        <div className="px-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {challenge?.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{project?.name || ''}</p>
        </div>
        {/* Instructions Panel */}
        <TaskInstructionsPanel />
        <ChallengeInfoPanel />
        <ProjectInfoPanel />

        {/* Metrics Panel */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
              Metrics
              <svg
                className="w-4 h-4 text-gray-500"
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
