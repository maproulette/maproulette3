import { useProjectContext } from '@/contexts/tasks/ProjectContext'

export const ProjectInfoPanel = () => {
  const { project } = useProjectContext()
  if (!project) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="border-gray-200 border-b px-4 py-3 dark:border-zinc-700">
        <h3 className="flex items-center justify-between font-semibold text-gray-900 text-sm dark:text-gray-100">
          Project Information
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
      <div className="px-4 py-3">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{project.name}</h4>
            <p className="text-gray-500 text-xs dark:text-gray-400">ID: {project.id}</p>
          </div>
          {project.description && (
            <p className="text-gray-600 text-sm dark:text-gray-300">{project.description}</p>
          )}
          {project.blurb && (
            <p className="text-gray-500 text-xs dark:text-gray-400">{project.blurb}</p>
          )}
          <div className="grid grid-cols-3 gap-4 border-gray-100 border-t pt-2 dark:border-zinc-700">
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                {project.difficulty}
              </div>
              <div className="text-gray-500 text-xs dark:text-gray-400">Difficulty</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                {project.tasksRemaining}
              </div>
              <div className="text-gray-500 text-xs dark:text-gray-400">Remaining</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                {project.completionPercentage}%
              </div>
              <div className="text-gray-500 text-xs dark:text-gray-400">Complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
