import { MapPin } from 'lucide-react'
import { MapControls as SharedMapControls } from '@/components/shared/MapControls'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { useTaskMapContext } from '@/contexts/tasks/TaskMapContext'
import type { StyleSwitcherPanelProps } from './StyleSwitcherPanel'
import { StyleSwitcherPanel } from './StyleSwitcherPanel'
import { zoomToTask } from './zoomToTask'

interface MapControlsProps {
  styleSwitcherPanelProps?: Omit<StyleSwitcherPanelProps, 'isOpen'>
}

export const MapControls = ({ styleSwitcherPanelProps }: MapControlsProps) => {
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
      showZoom={true}
      showReset={true}
      showLayers={true}
      StyleSwitcherPanel={StyleSwitcherPanel}
      styleSwitcherPanelProps={styleSwitcherPanelProps}
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
