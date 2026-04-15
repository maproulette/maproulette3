import { createFileRoute, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { api } from '@/api'
import { Task } from '@/components/Pages/TaskEditPage'
import { logger } from '@/lib/logger'

const taskSearchSchema = z.object({
  tab: z.enum(['task', 'properties', 'comments', 'osm']).optional(),
})

export const Route = createFileRoute('/_app/tasks/$taskId/')({
  validateSearch: taskSearchSchema,
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
    logger.error('Error loading task route', { error })
    notFound({ throw: true })
  },
  component: Task,
})
