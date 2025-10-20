import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useMapContext } from '@/contexts/MapContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { zoomToTask } from './zoomToTask'

export const MapControls = () => {
  const { map } = useMapContext()
  const { task } = useTaskContext()

  const handleZoomToTask = () => {
    if (map.current && task) {
      zoomToTask(map.current, task)
    }
  }

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        className="bg-white dark:bg-zinc-900"
        onClick={handleZoomToTask}
        title="Zoom to Task"
      >
        <MapPin className="h-4 w-4" />
      </Button>
    </div>
  )
}

