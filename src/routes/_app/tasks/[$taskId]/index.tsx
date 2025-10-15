import { createFileRoute, ErrorComponent, notFound } from '@tanstack/react-router'
import { Loader } from '@/components/ui/Loader'
import { Task } from '@/pages/task'
import { getTaskOptions } from '@/queries/tasks'

export const Route = createFileRoute('/_app/tasks/$taskId/')({
  head: () => ({
    meta: [
      {
        title: 'Task',
      },
    ],
  }),
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
