import { MapPin } from 'lucide-react'
import { MapControls as SharedMapControls } from '@/components/shared/MapControls'
import { useMapContext } from '@/contexts/MapContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { zoomToTask } from './zoomToTask'

export const MapControls = () => {
  const { map, mapLoaded } = useMapContext()
  const { task } = useTaskContext()

  const handleZoomToTask = () => {
    if (!map.current || !mapLoaded || !task) {
      return
    }

    zoomToTask(map.current, task)
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
          tooltip: 'Center to Task',
          disabled: !mapLoaded || !task,
        },
      ]}
    />
  )
}
