import { Crosshair, Eye, EyeOff, Filter } from 'lucide-react'
import { useMemo } from 'react'
import type { MapControlButton } from '@/components/shared/Map/MapControls'
import type { TaskBundle } from '@/components/TaskEditPage/TaskBundleContext'

export const useMapControlButtons = (
  mapLoaded: boolean,
  handleCenterToTask: () => void,
  markersHidden: boolean,
  setMarkersHidden: (hidden: boolean) => void,
  activeBundle: TaskBundle | null,
  showBundleOnly: boolean,
  setShowBundleOnly: (show: boolean) => void
): MapControlButton[] => {
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
