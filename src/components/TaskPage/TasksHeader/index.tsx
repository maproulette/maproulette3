import { Lock, Link, Share2, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTaskContext } from '@/contexts/tasks/TaskContext'

export const TasksHeader = () => {
  const { task } = useTaskContext()
  return (
    <div className="flex items-center space-x-4">
      <a
        href="/challenges"
        className="font-medium text-blue-600 text-sm hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        ← Back to Challenge
      </a>
      <div className="flex items-center space-x-2">
        <Lock className="h-4 w-4 text-gray-500" />
        <span className="text-gray-600 text-sm dark:text-gray-400">Task: {task.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Link className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Star className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
