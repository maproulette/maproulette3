import { Crosshair, Eye, EyeOff, Filter, Globe } from 'lucide-react'
import { useMemo } from 'react'
import type { MapControlButton } from '@/components/Map/MapControls'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import { useIntl } from '@/i18n'
import { useTaskEditMapContext } from './TaskEditMapContext'

export const useMapControlButtons = (
  mapLoaded: boolean,
  handleCenterToTask: () => void
): MapControlButton[] => {
  const { markersHidden, setMarkersHidden } = useTaskMapContext()
  const { activeBundle, showBundleOnly, setShowBundleOnly } = useTaskBundleContext()
  const { showExploreLayer, setShowExploreLayer } = useTaskEditMapContext()
  const { t } = useIntl()

  return useMemo(
    () => [
      {
        id: 'center-to-task',
        icon: Crosshair,
        onClick: handleCenterToTask,
        tooltip:
          activeBundle && activeBundle.taskIds.length > 1
            ? t('taskMap.controls.centerToBundle', undefined, 'Center to Bundle')
            : t('taskMap.controls.centerToTask', undefined, 'Center to Task'),
        disabled: !mapLoaded,
      },
      {
        id: 'toggle-markers',
        icon: markersHidden ? EyeOff : Eye,
        onClick: () => setMarkersHidden(!markersHidden),
        tooltip: markersHidden
          ? t('taskMap.controls.showAllMarkers', undefined, 'Show all markers')
          : t('taskMap.controls.hideAllMarkers', undefined, 'Hide all markers'),
        disabled: !mapLoaded,
        isActive: markersHidden,
      },
      {
        id: 'toggle-bundle-only',
        icon: Filter,
        onClick: () => setShowBundleOnly(!showBundleOnly),
        tooltip: showBundleOnly
          ? t('taskMap.controls.showAllTasks', undefined, 'Show all tasks (F)')
          : activeBundle
            ? t('taskMap.controls.showSelectedOnly', undefined, 'Show selected tasks only (F)')
            : t('taskMap.controls.showPrimaryOnly', undefined, 'Show primary task only (F)'),
        disabled: !mapLoaded,
        isActive: showBundleOnly,
      },
      {
        id: 'toggle-explore-layer',
        icon: Globe,
        onClick: () => setShowExploreLayer(!showExploreLayer),
        tooltip: showExploreLayer
          ? t('taskMap.controls.hideOtherChallenges', undefined, 'Hide tasks from other challenges')
          : t(
              'taskMap.controls.showOtherChallenges',
              undefined,
              'Show tasks from other challenges'
            ),
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
      t,
    ]
  )
}
