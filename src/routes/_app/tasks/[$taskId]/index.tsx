import { createFileRoute, notFound } from '@tanstack/react-router'
import { Task } from '@/pages/task'
import type { Task as TaskType } from '@/types/Task'
import { api } from '@/api'

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
    const task = await context.queryClient.ensureQueryData(api.tasks.getTask(taskId))
    return { task }
  },
  onError(error) {
    console.error('Error loading task route', error)
    notFound({ throw: true })
  },
  component: Task,
})
