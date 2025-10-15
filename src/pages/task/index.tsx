import { useLoaderData } from '@tanstack/react-router'
export const Task = () => {
  const { task } = useLoaderData({ from: '/_app/tasks/$taskId/' })
  return <div>Hello {task.name}!</div>
}
