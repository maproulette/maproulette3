import { useLoaderData } from '@tanstack/react-router'
import type { Task as TaskType } from '@/types/Task'

export const Task = () => {
  const loaderData = useLoaderData({ from: '/_app/tasks/$taskId/' })
  const { task }: { task: TaskType } = loaderData ?? { task: undefined as unknown as TaskType }

  return <div>Hello {task.name}!</div>
}
