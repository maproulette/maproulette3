import { createFileRoute, notFound } from '@tanstack/react-router'
import { api } from '@/api'
import { Task } from '@/pages/tasks'
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
    const task = await context.queryClient.ensureQueryData(api.task.getTask(taskId))
    return { task }
  },
  onError(error) {
    console.error('Error loading task route', error)
    notFound({ throw: true })
  },
  component: Task,
})
