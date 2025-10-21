import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const TaskActions = () => {
  return (
    <div className="flex items-center space-x-3">
      <Button variant="secondary" size="sm">
        Skip Task
      </Button>
      <Button variant="secondary" size="sm">
        <span>Modify Task</span>
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button size="sm">
        <span>Edit in iD (web editor)</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
