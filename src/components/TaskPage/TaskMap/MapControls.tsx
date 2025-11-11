import { MapPin } from 'lucide-react'
import { MapControls as SharedMapControls } from '@/components/shared'
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
    <SharedMapControls
      variant="task"
      customButtons={[
        {
          id: 'zoom-to-task',
          icon: MapPin,
          onClick: handleZoomToTask,
          tooltip: 'Zoom to Task',
        },
      ]}
    />
  )
}
