import { Crosshair, Eye, EyeOff, Filter } from 'lucide-react'
import { useMemo } from 'react'
import type { MapControlButton } from '@/components/shared/Map/MapControls'
import { useTaskBundleContext } from '@/components/TaskEditPage/TaskBundleContext'
import { useTaskMapContext } from '@/components/TaskEditPage/TaskMapContext'

export const useMapControlButtons = (
  mapLoaded: boolean,
  handleCenterToTask: () => void
): MapControlButton[] => {
  const { markersHidden, setMarkersHidden } = useTaskMapContext()
  const { activeBundle, showBundleOnly, setShowBundleOnly } = useTaskBundleContext()

  return useMemo(
    () => [
      {
        id: 'center-to-task',
        icon: Crosshair,
        onClick: handleCenterToTask,
        tooltip:
          activeBundle && activeBundle.taskIds.length > 1 ? 'Center to Bundle' : 'Center to Task',
        disabled: !mapLoaded,
      },
      {
        id: 'toggle-markers',
        icon: markersHidden ? EyeOff : Eye,
        onClick: () => setMarkersHidden(!markersHidden),
        tooltip: markersHidden ? 'Show all markers' : 'Hide all markers',
        disabled: !mapLoaded,
        isActive: markersHidden,
      },
      {
        id: 'toggle-bundle-only',
        icon: Filter,
        onClick: () => setShowBundleOnly(!showBundleOnly),
        tooltip: showBundleOnly
          ? 'Show all tasks (F)'
          : activeBundle
            ? 'Show selected tasks only (F)'
            : 'Show primary task only (F)',
        disabled: !mapLoaded,
        isActive: showBundleOnly,
      },
    ],
    [
      mapLoaded,
      handleCenterToTask,
      markersHidden,
      setMarkersHidden,
      activeBundle,
      showBundleOnly,
      setShowBundleOnly,
    ]
  )
}
