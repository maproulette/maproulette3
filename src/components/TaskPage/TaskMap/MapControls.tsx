import { MapPin } from 'lucide-react'
import { MapControls as SharedMapControls } from '@/components/shared/MapControls'
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
      collapsible={true}
      defaultOpen={true}
      showZoom={false}
      showReset={false}
      showLayers={false}
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
