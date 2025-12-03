import { MapPin } from 'lucide-react'
import { MapControls as SharedMapControls } from '@/components/shared/MapControls'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { useTaskMapContext } from '@/contexts/tasks/TaskMapContext'
import { zoomToTask } from './zoomToTask'

export const MapControls = () => {
  const { map, mapLoaded } = useTaskMapContext()
  const { task } = useTaskContext()

  const handleZoomToTask = () => {
    if (!map.current || !mapLoaded || !task) {
      return
    }

    zoomToTask(map.current, task)
  }

  return (
    <SharedMapControls
      map={map}
      mapLoaded={mapLoaded}
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
