import { useLoaderData } from "@tanstack/react-router"
export const TaskPage = () => {
    const { task } = useLoaderData({ from: '/_app/tasks/$taskId/' })
    return <div>Hello {task.name}!</div>
  }
  