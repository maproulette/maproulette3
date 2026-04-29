import { Crosshair, Eye, EyeOff, Filter, Globe } from 'lucide-react'
import { useMemo } from 'react'
import type { MapControlButton } from '@/components/Map/MapControls'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import { useTaskEditMapContext } from './TaskEditMapContext'

export const useMapControlButtons = (
  mapLoaded: boolean,
  handleCenterToTask: () => void
): MapControlButton[] => {
  const { markersHidden, setMarkersHidden } = useTaskMapContext()
  const { activeBundle, showBundleOnly, setShowBundleOnly } = useTaskBundleContext()
  const { showExploreLayer, setShowExploreLayer } = useTaskEditMapContext()

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
      {
        id: 'toggle-explore-layer',
        icon: Globe,
        onClick: () => setShowExploreLayer(!showExploreLayer),
        tooltip: showExploreLayer
          ? 'Hide tasks from other challenges'
          : 'Show tasks from other challenges',
        disabled: !mapLoaded,
        isActive: showExploreLayer,
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
      showExploreLayer,
      setShowExploreLayer,
    ]
  )
}
