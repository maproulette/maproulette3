import { createFileRoute, notFound } from '@tanstack/react-router'
import { api } from '@/api'
import { Task } from '@/components/TaskPage'

export const Route = createFileRoute('/_app/tasks/$taskId/')({
  loader: async ({ context, params: { taskId } }) => {
    const task = await context.queryClient.ensureQueryData(api.task.getTask(Number(taskId)))
    return { task }
  },
  head: ({ loaderData }) => {
    const task = loaderData?.task

    return {
      meta: [
        {
          title: task?.name ? `Task: ${task.name}` : 'Loading task',
        },
      ],
    }
  },
  onError(error) {
    console.error('Error loading task route', error)
    notFound({ throw: true })
  },
  component: Task,
})
