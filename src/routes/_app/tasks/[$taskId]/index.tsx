import { createFileRoute, notFound } from '@tanstack/react-router'
import { api } from '@/api'
import { Task } from '@/components/TaskEditPage'

export const Route = createFileRoute('/_app/tasks/$taskId/')({
  staticData: { pageTitle: 'Task' },
  loader: async ({ params: { taskId }, context: { queryClient } }) => {
    const task = await queryClient.ensureQueryData(api.task.getTaskOptions(Number(taskId)))
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
