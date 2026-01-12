import { MapPin } from 'lucide-react'
import { MapControls as SharedMapControls } from '@/components/shared/MapControls'
import { useOSMDataContext } from '@/contexts/tasks/OSMDataContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { useTaskMapContext } from '@/contexts/tasks/TaskMapContext'
import { StyleSwitcherPanel } from './StyleSwitcherPanel'
import { zoomToTask } from './zoomToTask'

export const MapControls = () => {
  const { map, mapLoaded } = useTaskMapContext()
  const { task } = useTaskContext()
  const {
    showTaskFeatures,
    setShowTaskFeatures,
    showOSMData,
    handleToggleOSMData,
    showOSMElements,
    handleToggleOSMElement,
    osmElementOrder,
    setOsmElementOrder,
    osmDataLoading,
    dataLayerOrder,
    setDataLayerOrder,
  } = useOSMDataContext()

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
      styleSwitcherPanelProps={{
        showTaskFeatures,
        onToggleTaskFeatures: () => setShowTaskFeatures((prev) => !prev),
        showOSMData,
        onToggleOSMData: handleToggleOSMData,
        showOSMElements,
        onToggleOSMElement: handleToggleOSMElement,
        osmElementOrder,
        onReorderOSMElements: setOsmElementOrder,
        osmDataLoading,
        dataLayerOrder,
        onReorderDataLayers: setDataLayerOrder,
      }}
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
