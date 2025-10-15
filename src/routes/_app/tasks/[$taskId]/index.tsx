import { createFileRoute, notFound } from '@tanstack/react-router'
import { TaskMap } from '@/components/Map'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { getChallengeOptions, getProjectOptions } from '@/queries/challenges'
import { getTaskOptions } from '@/queries/tasks'

export const Route = createFileRoute('/_app/tasks/$taskId/')({
  loader: async ({ context, params: { taskId } }) => {
    const task = await context.queryClient.ensureQueryData(getTaskOptions(taskId))
    if (!task) notFound({ throw: true })

    const challenge = await context.queryClient.ensureQueryData(
      getChallengeOptions(task.parent.toString())
    )

    const project = challenge?.parent
      ? await context.queryClient.ensureQueryData(getProjectOptions(challenge.parent.toString()))
      : null

    return { task, challenge, project }
  },
  errorComponent: ({ error }) => {
    // Render an error message
    return <div>{error.message}</div>
  },
  pendingComponent: () => <Loader isFullScreen />,
  component: RouteComponent,
})

function RouteComponent() {
  const { task, challenge, project } = Route.useLoaderData()
  console.log({ task, challenge, project })

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4 pt-26">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a
              href="/challenges"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              ← Back to Challenge
            </a>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <title>Lock icon</title>
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600 dark:text-gray-400 text-sm">Task: {task.name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" size="sm">
              Skip Task
            </Button>
            <Button variant="secondary" size="sm">
              <span>Modify Task</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
            <Button size="sm">
              <span>Edit in iD (web editor)</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
              <Button variant="ghost" size="icon">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3 3 0 000-2.408l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div
          className="w-96 bg-gray-50 dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800"
          style={{ height: 'calc(100vh - 10rem)' }}
        >
          <div className="p-4 space-y-4 overflow-y-auto h-full">
            {/* Challenge Title */}
            <div className="px-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {challenge.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{project?.name || ''}</p>
            </div>
            {/* Instructions Panel */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                  Instructions
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </h3>
              </div>
              <div className="px-4 py-3">
                {challenge.instruction && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <p>{challenge.instruction}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Challenge Panel */}
            {challenge && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                    Challenge Information
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
                <div className="px-4 py-3">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {challenge.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: {challenge.id}</p>
                    </div>
                    {challenge.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {challenge.description}
                      </p>
                    )}
                    {challenge.blurb && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{challenge.blurb}</p>
                    )}
                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-zinc-700">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {challenge.difficulty}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Difficulty</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {challenge.tasksRemaining}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Remaining</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {challenge.completionPercentage}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Project Panel */}
            {project && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                    Project Information
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
                <div className="px-4 py-3">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {project.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: {project.id}</p>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {project.description}
                      </p>
                    )}
                    {project.blurb && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{project.blurb}</p>
                    )}
                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-zinc-700">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {project.difficulty}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Difficulty</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {project.tasksRemaining}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Remaining</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {project.completionPercentage}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

        {/* Map Area */}
        <div className="flex-1 relative" style={{ height: 'calc(100vh - 10rem)' }}>
          <TaskMap task={task} className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}
