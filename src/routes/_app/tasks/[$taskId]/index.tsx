import { createFileRoute, ErrorComponent, notFound } from '@tanstack/react-router'
import { Loader } from '@/components/ui/Loader'
import { Task } from '@/pages/task'
import { getTaskOptions } from '@/queries/tasks'
import type { Task as TaskType } from '@/types/Task'

export const Route = createFileRoute('/_app/tasks/$taskId/')({
  head: ({ loaderData }) => {
    const { task }: { task: TaskType } = loaderData ?? { task: undefined as unknown as TaskType }

    return {
      meta: [
        {
          title: task?.name ? `Task: ${task.name}` : 'Loading task',
        },
      ],
    }
  },
  loader: async ({ context, params: { taskId } }) => {
    const task = await context.queryClient.ensureQueryData(getTaskOptions(taskId))
    if (!task) notFound({ throw: true })
    return { task }
  },
  errorComponent: ({ error }) => {
    return <ErrorComponent error={error} />
  },
  pendingComponent: () => <Loader isFullScreen />,
  component: Task,
})
