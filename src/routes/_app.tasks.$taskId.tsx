import { createFileRoute, notFound } from '@tanstack/react-router'
import { Loader } from '@/components/ui/Loader'
import { getTaskOptions } from '@/queries/tasks'

export const Route = createFileRoute('/_app/tasks/$taskId')({
  loader: async ({ context, params: { taskId } }) => {
    const task = await context.queryClient.ensureQueryData(getTaskOptions(taskId))
    if (!task) notFound({ throw: true })
    return { task }
  },
  errorComponent: ({ error }) => {
    // Render an error message
    return <div>{error.message}</div>
  },
  pendingComponent: () => <Loader isFullScreen />,
  component: RouteComponent,
})

function RouteComponent() {
  const { task } = Route.useLoaderData()
  return <div>Hello {task.name}!</div>
}
